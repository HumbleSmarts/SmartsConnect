-- Core schema for SmartsConnect: profiles, channels, messages, reactions.
-- Targets a Supabase project (relies on the auth.uid() helper and the
-- auth.users table that Supabase's GoTrue service provides).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users row, holding the app-facing user fields
-- that used to live in Firestore's "users" collection.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  display_name text,
  photo_url text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up, instead of the
-- client-side "check if doc exists, else create" dance the old app did.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, display_name, photo_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    split_part(coalesce(new.raw_user_meta_data ->> 'full_name', new.email), ' ', 1),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- channels
-- ---------------------------------------------------------------------------
create table public.channels (
  id uuid primary key default gen_random_uuid(),
  channel_name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.channels enable row level security;

create policy "Channels are viewable by authenticated users"
  on public.channels for select
  to authenticated
  using (true);

create policy "Authenticated users can create channels"
  on public.channels for insert
  to authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text,
  user_img text,
  text text not null,
  post_img text,
  like_count integer not null default 0,
  fire_count integer not null default 0,
  heart_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index messages_channel_id_created_at_idx
  on public.messages (channel_id, created_at);

alter table public.messages enable row level security;

create policy "Messages are viewable by authenticated users"
  on public.messages for select
  to authenticated
  using (true);

create policy "Users can send messages as themselves"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own messages"
  on public.messages for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- message_reactions: normalized replacement for Firestore's per-message
-- {uid: true} maps (one row per user per reaction per message).
-- ---------------------------------------------------------------------------
create table public.message_reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'fire', 'heart')),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, reaction_type)
);

alter table public.message_reactions enable row level security;

create policy "Reactions are viewable by authenticated users"
  on public.message_reactions for select
  to authenticated
  using (true);

create policy "Users can add their own reactions"
  on public.message_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove their own reactions"
  on public.message_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- Keep messages.*_count in sync with message_reactions so the UI can read a
-- plain count column instead of aggregating on every render.
create function public.handle_reaction_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_message_id uuid := coalesce(new.message_id, old.message_id);
  target_type text := coalesce(new.reaction_type, old.reaction_type);
  delta integer := case when tg_op = 'INSERT' then 1 else -1 end;
begin
  if target_type = 'like' then
    update public.messages set like_count = like_count + delta where id = target_message_id;
  elsif target_type = 'fire' then
    update public.messages set fire_count = fire_count + delta where id = target_message_id;
  elsif target_type = 'heart' then
    update public.messages set heart_count = heart_count + delta where id = target_message_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger on_reaction_added
  after insert on public.message_reactions
  for each row execute procedure public.handle_reaction_change();

create trigger on_reaction_removed
  after delete on public.message_reactions
  for each row execute procedure public.handle_reaction_change();

-- Atomically toggle the current user's reaction on a message: removes it if
-- present, adds it if absent. Replaces the three near-identical client-side
-- read-then-write transactions (likeClick/fireClick/heartClick) that the
-- Firestore version had to hand-roll.
create function public.toggle_reaction(p_message_id uuid, p_reaction_type text)
returns boolean
language plpgsql
security invoker
as $$
declare
  already_reacted boolean;
begin
  if p_reaction_type not in ('like', 'fire', 'heart') then
    raise exception 'invalid reaction_type: %', p_reaction_type;
  end if;

  select exists (
    select 1 from public.message_reactions
    where message_id = p_message_id
      and user_id = auth.uid()
      and reaction_type = p_reaction_type
  ) into already_reacted;

  if already_reacted then
    delete from public.message_reactions
      where message_id = p_message_id
        and user_id = auth.uid()
        and reaction_type = p_reaction_type;
    return false;
  else
    insert into public.message_reactions (message_id, user_id, reaction_type)
      values (p_message_id, auth.uid(), p_reaction_type);
    return true;
  end if;
end;
$$;

-- Messages for a channel, joined with "did the current user react" flags,
-- in the shape Messages.jsx needs (mirrors the old values.likes[uid] checks).
create function public.get_channel_messages(p_channel_id uuid)
returns table (
  id uuid,
  user_id uuid,
  user_name text,
  user_img text,
  text text,
  post_img text,
  like_count integer,
  fire_count integer,
  heart_count integer,
  liked_by_me boolean,
  fired_by_me boolean,
  hearted_by_me boolean,
  created_at timestamptz
)
language sql
security invoker
stable
as $$
  select
    m.id, m.user_id, m.user_name, m.user_img, m.text, m.post_img,
    m.like_count, m.fire_count, m.heart_count,
    exists (
      select 1 from public.message_reactions r
      where r.message_id = m.id and r.user_id = auth.uid() and r.reaction_type = 'like'
    ),
    exists (
      select 1 from public.message_reactions r
      where r.message_id = m.id and r.user_id = auth.uid() and r.reaction_type = 'fire'
    ),
    exists (
      select 1 from public.message_reactions r
      where r.message_id = m.id and r.user_id = auth.uid() and r.reaction_type = 'heart'
    ),
    m.created_at
  from public.messages m
  where m.channel_id = p_channel_id
  order by m.created_at asc;
$$;

-- Let Realtime stream INSERT/UPDATE/DELETE on these tables to subscribed
-- clients (new messages, reaction count changes, new channels, profile
-- edits made from another tab/device).
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.channels;
alter publication supabase_realtime add table public.profiles;
