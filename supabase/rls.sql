-- Run this file after init.sql. It installs profile creation and baseline RLS.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  requested_grade text := new.raw_user_meta_data ->> 'grade';
  safe_role text := case when requested_role = 'manager' then 'manager' else 'student' end;
begin
  insert into public.profiles (
    id,
    email,
    name,
    role,
    student_no,
    department,
    grade,
    manager_status
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    safe_role,
    case when safe_role = 'student' then new.raw_user_meta_data ->> 'student_no' end,
    case when safe_role = 'student' then new.raw_user_meta_data ->> 'department' end,
    case
      when safe_role = 'student' and requested_grade ~ '^[1-4]$'
        then requested_grade::int
    end,
    case when safe_role = 'manager' then 'pending' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

alter table public.profiles enable row level security;
alter table public.internship_sessions enable row level security;
alter table public.job_codes enable row level security;
alter table public.companies enable row level security;
alter table public.internship_recruitments enable row level security;
alter table public.applications enable row level security;
alter table public.matchings enable row level security;
alter table public.notices enable row level security;
alter table public.consultations enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (name, student_no, department, grade, desired_job)
  on public.profiles to authenticated;

create policy "sessions_select_authenticated"
  on public.internship_sessions for select
  to authenticated
  using (true);

create policy "job_codes_select_authenticated"
  on public.job_codes for select
  to authenticated
  using (true);

create policy "companies_select_authenticated"
  on public.companies for select
  to authenticated
  using (true);

create policy "recruitments_select_authenticated"
  on public.internship_recruitments for select
  to authenticated
  using (true);

create policy "applications_manage_own"
  on public.applications for all
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "matchings_select_own"
  on public.matchings for select
  to authenticated
  using (student_id = auth.uid());

create policy "notices_select_relevant"
  on public.notices for select
  to authenticated
  using (
    target_role = 'all'
    or target_role = (select role from public.profiles where id = auth.uid())
  );

create policy "consultations_select_own"
  on public.consultations for select
  to authenticated
  using (student_id = auth.uid());

create policy "consultations_insert_own"
  on public.consultations for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke update on public.notifications from authenticated;
grant update (is_read) on public.notifications to authenticated;

create policy "sessions_admin_all"
  on public.internship_sessions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "job_codes_admin_all"
  on public.job_codes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "companies_admin_all"
  on public.companies for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "recruitments_admin_all"
  on public.internship_recruitments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "applications_admin_all"
  on public.applications for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "matchings_admin_all"
  on public.matchings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "notices_admin_all"
  on public.notices for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "consultations_admin_all"
  on public.consultations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "notifications_admin_all"
  on public.notifications for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
