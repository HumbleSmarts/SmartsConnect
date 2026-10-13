-- Storage bucket for chat image uploads (replaces the Firebase Storage
-- "images/" path used by FileUpload.jsx). Only valid against a real
-- Supabase project, since the storage.buckets/storage.objects tables are
-- created by Supabase's Storage service, not plain Postgres.

insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', true)
on conflict (id) do nothing;

create policy "Chat images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'chat-images');

create policy "Authenticated users can upload chat images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'chat-images');
