-- Run this file once in the Supabase SQL Editor for an existing database.
-- It allows administrators to create and update internship sessions.

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

alter table public.internship_sessions enable row level security;
grant select, insert, update, delete on public.internship_sessions to authenticated;

drop policy if exists "sessions_select_authenticated"
  on public.internship_sessions;

drop policy if exists "sessions_admin_all"
  on public.internship_sessions;

create policy "sessions_select_authenticated"
  on public.internship_sessions for select
  to authenticated
  using (true);

create policy "sessions_admin_all"
  on public.internship_sessions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
