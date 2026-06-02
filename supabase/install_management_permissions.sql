-- Run this file once in the Supabase SQL Editor for an existing database.
-- It repairs admin and approved-manager permissions used by management pages.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_approved_manager()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'manager'
      and manager_status = 'approved'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_approved_manager() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_approved_manager() to authenticated;

alter table public.profiles enable row level security;
alter table public.internship_sessions enable row level security;
alter table public.companies enable row level security;
alter table public.internship_recruitments enable row level security;
alter table public.applications enable row level security;
alter table public.matchings enable row level security;

alter table public.profiles
  add column if not exists phone text;

alter table public.internship_sessions
  drop constraint if exists internship_sessions_term_check;

alter table public.internship_sessions
  add constraint internship_sessions_term_check
  check (term in ('1학기', '하계', '하계_2학기', '2학기', '동계', '동계_1학기'));

alter table public.internship_recruitments
  drop constraint if exists internship_recruitments_status_check;

alter table public.internship_recruitments
  add constraint internship_recruitments_status_check
  check (status in ('open', 'reviewing', 'closed'));

insert into public.internship_sessions (year, term, name, status)
select 2026, '하계_2학기', '2026년 하계_2학기 SWCore 인턴십', 'draft'
where not exists (
  select 1 from public.internship_sessions where year = 2026 and term = '하계_2학기'
);

insert into public.internship_sessions (year, term, name, status)
select 2026, '동계_1학기', '2026년 동계_1학기 SWCore 인턴십', 'draft'
where not exists (
  select 1 from public.internship_sessions where year = 2026 and term = '동계_1학기'
);

grant select on public.profiles to authenticated;
grant update (name, phone, student_no, department, grade, desired_job) on public.profiles to authenticated;
grant select, insert, update, delete on public.internship_sessions to authenticated;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.internship_recruitments to authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, update, delete on public.matchings to authenticated;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_manager_select" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_manager_select" on public.profiles for select to authenticated using (public.is_approved_manager());

drop policy if exists "sessions_select_authenticated" on public.internship_sessions;
drop policy if exists "sessions_admin_all" on public.internship_sessions;
create policy "sessions_select_authenticated" on public.internship_sessions for select to authenticated using (true);
create policy "sessions_admin_all" on public.internship_sessions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "companies_select_authenticated" on public.companies;
drop policy if exists "companies_admin_all" on public.companies;
drop policy if exists "companies_manager_all" on public.companies;
create policy "companies_select_authenticated" on public.companies for select to authenticated using (true);
create policy "companies_admin_all" on public.companies for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "companies_manager_all" on public.companies for all to authenticated using (public.is_approved_manager()) with check (public.is_approved_manager());

alter table public.internship_recruitments
  add column if not exists is_visible_to_students boolean not null default false;
drop policy if exists "recruitments_select_authenticated" on public.internship_recruitments;
drop policy if exists "recruitments_select_relevant" on public.internship_recruitments;
drop policy if exists "recruitments_admin_all" on public.internship_recruitments;
drop policy if exists "recruitments_manager_all" on public.internship_recruitments;
create policy "recruitments_select_relevant" on public.internship_recruitments for select to authenticated using (is_visible_to_students or public.is_admin() or public.is_approved_manager());
create policy "recruitments_admin_all" on public.internship_recruitments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "recruitments_manager_all" on public.internship_recruitments for all to authenticated using (public.is_approved_manager()) with check (public.is_approved_manager());

drop policy if exists "applications_admin_all" on public.applications;
drop policy if exists "applications_manager_all" on public.applications;
create policy "applications_admin_all" on public.applications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "applications_manager_all" on public.applications for all to authenticated using (public.is_approved_manager()) with check (public.is_approved_manager());

create unique index if not exists matchings_session_student_idx
  on public.matchings (session_id, student_id);

create or replace function public.enforce_application_selection_rule()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_term text;
  blocked_terms text[];
begin
  if new.status <> 'selected' then
    return new;
  end if;

  select term
    into target_term
  from public.internship_sessions
  where id = new.session_id;

  blocked_terms := case
    when target_term in ('하계', '하계_2학기') then array['하계', '하계_2학기']
    when target_term in ('동계', '동계_1학기') then array['동계', '동계_1학기']
    else null
  end;

  if blocked_terms is not null and exists (
    select 1
    from public.applications as applications
    join public.internship_sessions as sessions
      on sessions.id = applications.session_id
    where applications.student_id = new.student_id
      and applications.id <> new.id
      and applications.status = 'selected'
      and sessions.term = any(blocked_terms)
  ) then
    raise exception '% 세션 묶음에서는 학생 1명당 1개 기업만 선발 저장할 수 있습니다.', array_to_string(blocked_terms, ', ');
  end if;

  return new;
end;
$$;

drop trigger if exists on_application_selection_rule on public.applications;
create trigger on_application_selection_rule
  before insert or update of status, session_id, student_id
  on public.applications
  for each row execute procedure public.enforce_application_selection_rule();

drop policy if exists "matchings_select_own" on public.matchings;
drop policy if exists "matchings_admin_all" on public.matchings;
create policy "matchings_select_own" on public.matchings for select to authenticated using (student_id = auth.uid());
create policy "matchings_admin_all" on public.matchings for all to authenticated using (public.is_admin()) with check (public.is_admin());
