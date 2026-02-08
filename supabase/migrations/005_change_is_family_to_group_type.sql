-- Add group_type column and migrate data
alter table public.households add column if not exists group_type text default 'individual';

-- Migrate existing is_family data
update public.households set group_type = 'family' where is_family = true;

-- Remove old column
alter table public.households drop column if exists is_family;
