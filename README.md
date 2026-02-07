# Wedding Planner

A personal wedding planning app with user accounts, budget tracking, task management, and guest lists. Built with Next.js and Supabase.

## Stack

- **Frontend:** Next.js 14 (App Router) + React 18
- **Auth & Database:** Supabase (Postgres + Auth + RLS)
- **Styling:** Inline styles (Cormorant Garamond + DM Sans)

## Setup

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project. Note your:
- **Project URL** (e.g. `https://abcdefg.supabase.co`)
- **Anon/public key** (found in Settings > API)

### 2. Run the Database Migration

In your Supabase dashboard, go to **SQL Editor** and paste the contents of:

```
supabase/migrations/001_create_user_data.sql
```

Click **Run**. This creates the `user_data` table with Row Level Security policies so each user can only access their own data.

### 3. Configure Auth (Optional but Recommended)

In your Supabase dashboard under **Authentication > Settings**:

- **Email Auth:** Enabled by default. Consider enabling "Confirm email" for production.
- **Site URL:** Set to your deployed URL (e.g. `https://your-app.vercel.app`)
- **Redirect URLs:** Add your localhost and production URLs

### 4. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase URL and anon key.

### 5. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push to a Git repo (GitHub, GitLab, etc.)
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the two environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Deploying to Netlify

1. Push to a Git repo
2. Import in [netlify.com](https://netlify.com)
3. Set build command to `npm run build` and publish directory to `.next`
4. Add the two environment variables in Netlify's site settings
5. You may need the `@netlify/plugin-nextjs` plugin for full Next.js support

## Security Notes

- The **anon key is safe to use client-side.** Supabase designed it that way. Row Level Security (RLS) on the `user_data` table ensures users can only read/write their own rows.
- The **service_role key** bypasses RLS entirely. Never expose it in client-side code or commit it to version control.
- The migration file enables RLS and creates policies that restrict all operations to `auth.uid() = user_id`.

## Project Structure

```
wedding-planner/
  .env.local.example          # Template for environment variables
  package.json
  next.config.js
  jsconfig.json                # Path alias (@/*)
  supabase/
    migrations/
      001_create_user_data.sql # Database schema + RLS policies
  src/
    lib/
      supabase.js              # Supabase client (browser)
      planner-data.js           # Save/load/delete functions
    components/
      AuthProvider.jsx          # React context for auth state
      AuthGate.jsx              # Shows login or app based on auth
      LoginPage.jsx             # Supabase Auth UI (styled)
      WeddingPlanner.jsx        # Main planner component
    app/
      layout.jsx                # Root layout with AuthProvider
      page.jsx                  # Entry point
```

## How Data Works

All planner data (budget, timeline, guests, notes, settings) is stored as a single JSON blob in the `user_data` table. Each user gets exactly one row. The app auto-saves with a 1.2-second debounce after any change.

This approach keeps things simple. If you later want to normalize the data (separate tables for guests, tasks, etc.), you can migrate without changing the frontend much since the save/load functions in `planner-data.js` are the only interface to the database.
