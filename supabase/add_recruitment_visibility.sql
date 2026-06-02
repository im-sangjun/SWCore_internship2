-- Run this file once in the Supabase SQL Editor for an existing database.
-- New recruitment rows remain hidden from students until an admin or manager
-- enables the visibility toggle.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.is_approved_manager()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'manager'
      and manager_status = 'approved'
  );
$$;

revoke all on function public.is_approved_manager() from public;
grant execute on function public.is_approved_manager() to authenticated;

alter table public.internship_recruitments
  add column if not exists is_visible_to_students boolean not null default false;

-- Publish existing open rows once during migration. New rows remain hidden
-- because the column default is false and the UI inserts false explicitly.
update public.internship_recruitments
set is_visible_to_students = true
where status = 'open'
  and is_visible_to_students = false;

drop policy if exists "recruitments_select_authenticated"
  on public.internship_recruitments;

drop policy if exists "recruitments_select_relevant"
  on public.internship_recruitments;

create policy "recruitments_select_relevant"
  on public.internship_recruitments for select
  to authenticated
  using (
    is_visible_to_students
    or public.is_admin()
    or public.is_approved_manager()
  );
