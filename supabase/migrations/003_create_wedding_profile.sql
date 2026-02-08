-- ============================================================
-- Wedding Planner: Public Wedding Profiles
-- ============================================================

-- 1. Create the table
create table if not exists public.wedding_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  partner_names text,
  wedding_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.wedding_profiles enable row level security;

-- 3. Policies
create policy "Anyone can view wedding profiles"
  on public.wedding_profiles for select
  using (true);

create policy "Users can manage own wedding profile"
  on public.wedding_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Trigger for updated_at
create trigger on_wedding_profiles_updated
  before update on public.wedding_profiles
  for each row
  execute function public.handle_updated_at();

-- 5. Index
create index if not exists idx_wedding_profiles_user_id on public.wedding_profiles(user_id);
