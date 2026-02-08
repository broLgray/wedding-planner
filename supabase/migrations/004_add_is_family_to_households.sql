-- Add is_family column to households
alter table public.households add column if not exists is_family boolean default false;
