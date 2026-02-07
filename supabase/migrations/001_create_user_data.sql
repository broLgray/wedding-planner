-- ============================================================
-- Wedding Planner: User Data Table + Row Level Security
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- or use the Supabase CLI: supabase db push
-- ============================================================

-- 1. Create the table
create table if not exists public.user_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Unique constraint so upsert works on user_id
alter table public.user_data
  add constraint user_data_user_id_unique unique (user_id);

-- 3. Enable Row Level Security
alter table public.user_data enable row level security;

-- 4. Policies: users can only touch their own row
create policy "Users can read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own data"
  on public.user_data for delete
  using (auth.uid() = user_id);

-- 5. Auto-update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_data_updated
  before update on public.user_data
  for each row
  execute function public.handle_updated_at();

-- 6. Index for fast lookups by user_id
create index if not exists idx_user_data_user_id
  on public.user_data(user_id);
