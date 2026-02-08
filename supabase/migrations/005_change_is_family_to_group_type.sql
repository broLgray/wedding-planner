-- 1. Safely add group_type column if it doesn't already exist
alter table public.households add column if not exists group_type text default 'individual';

-- 2. Safely migrate data and remove the old column ONLY if it exists
do $$
begin
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'households' and column_name = 'is_family') then
        -- Move existing family flags to the new type
        update public.households set group_type = 'family' where is_family = true;
        
        -- Now it's safe to drop the old column
        alter table public.households drop column is_family;
    end if;
end $$;
