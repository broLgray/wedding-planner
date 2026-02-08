-- ============================================================
-- Wedding Planner: Households and Guests Tables
-- ============================================================

-- 1. Create households table
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text,
  rsvp_token text unique default encode(gen_random_bytes(12), 'hex'),
  invitation_sent boolean default false,
  thank_you_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create guests table
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  rsvp_status text check (rsvp_status in ('pending', 'attending', 'declined')) default 'pending',
  dietary_requirements text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.households enable row level security;
alter table public.guests enable row level security;

-- 4. Policies for households
create policy "Users can manage own households"
  on public.households for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view household via token"
  on public.households for select
  using (true); -- We will filter by token in the app

create policy "Public can update household via token"
  on public.households for update
  using (true)
  with check (true);

-- 5. Policies for guests
create policy "Users can manage own guests"
  on public.guests for all
  using (
    exists (
      select 1 from public.households
      where households.id = guests.household_id
      and households.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.households
      where households.id = guests.household_id
      and households.user_id = auth.uid()
    )
  );

create policy "Public can view guests via household"
  on public.guests for select
  using (true);

create policy "Public can update guests via household"
  on public.guests for update
  using (true)
  with check (true);

-- 6. Updated at triggers
create trigger on_households_updated
  before update on public.households
  for each row
  execute function public.handle_updated_at();

create trigger on_guests_updated
  before update on public.guests
  for each row
  execute function public.handle_updated_at();

-- 7. Indexes
create index if not exists idx_households_user_id on public.households(user_id);
create index if not exists idx_households_rsvp_token on public.households(rsvp_token);
create index if not exists idx_guests_household_id on public.guests(household_id);
