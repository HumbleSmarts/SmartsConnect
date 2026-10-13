# SmartsConnect

A live chat app built with React, Vite, MUI, and Supabase (Postgres).

## Setup

1. Create a project at [supabase.com](https://supabase.com) (or run one locally
   with the [Supabase CLI](https://supabase.com/docs/guides/local-development)
   if you have Docker available).
2. Enable the Google auth provider under
   **Authentication → Providers → Google** in the Supabase dashboard, and add
   your OAuth client ID/secret from the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
3. Apply the SQL migrations in `supabase/migrations/` to your project, in
   order, either via the Supabase CLI (`supabase link` then
   `supabase db push`) or by pasting each file into the dashboard's SQL
   Editor:
   - `0001_init.sql` — tables, RLS policies, triggers, and RPCs
   - `0002_storage.sql` — the `chat-images` storage bucket used for image
     uploads (only valid against a real Supabase project; plain Postgres has
     no `storage` schema)
4. Copy `.env.example` to `.env` and fill in your project's URL and anon key
   (**Project Settings → API** in the dashboard):
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Install dependencies and run the app:
   ```
   npm install
   npm run dev
   ```

## Building for production

```
npm run build
```

Outputs a static bundle to `dist/`. `firebase.json` is still set up to serve
that folder via Firebase Hosting if you want to keep using it purely as a
static host — it's unrelated to the Postgres/Supabase migration, since
Hosting never talked to Firestore or Firebase Auth in the first place.
