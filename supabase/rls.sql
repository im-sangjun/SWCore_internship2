-- Run this file after init.sql. It installs profile creation and baseline RLS.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  requested_grade text := new.raw_user_meta_data ->> 'grade';
  safe_role text := case
    when lower(new.email) = 'imsangjun@gmail.com' then 'admin'
    when requested_role = 'manager' then 'manager'
    else 'student'
  end;
begin
  insert into public.profiles (
    id,
    email,
    name,
    phone,
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
    new.raw_user_meta_data ->> 'phone',
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

-- Backfill profiles for accounts created before the trigger was installed.
insert into public.profiles (
  id,
  email,
  name,
  phone,
  role,
  student_no,
  department,
  grade,
  manager_status
)
select
  users.id,
  users.email,
  users.raw_user_meta_data ->> 'name',
  users.raw_user_meta_data ->> 'phone',
  case
    when lower(users.email) = 'imsangjun@gmail.com' then 'admin'
    when users.raw_user_meta_data ->> 'role' = 'manager' then 'manager'
    else 'student'
  end,
  case
    when users.raw_user_meta_data ->> 'role' = 'manager' then null
    else users.raw_user_meta_data ->> 'student_no'
  end,
  case
    when users.raw_user_meta_data ->> 'role' = 'manager' then null
    else users.raw_user_meta_data ->> 'department'
  end,
  case
    when users.raw_user_meta_data ->> 'role' is distinct from 'manager'
      and users.raw_user_meta_data ->> 'grade' ~ '^[1-4]$'
      then (users.raw_user_meta_data ->> 'grade')::int
  end,
  case
    when users.raw_user_meta_data ->> 'role' = 'manager' then 'pending'
  end
from auth.users as users
where users.email is not null
on conflict (id) do nothing;

-- Apply the default administrator role when this policy file is added after signup.
update public.profiles
set role = 'admin', manager_status = null
where lower(email) = 'imsangjun@gmail.com';

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

create or replace function public.set_manager_status(
  target_id uuid,
  next_status text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 매니저 승인 상태를 변경할 수 있습니다.';
  end if;

  if next_status not in ('pending', 'approved', 'rejected') then
    raise exception '유효하지 않은 승인 상태입니다.';
  end if;

  update public.profiles
  set manager_status = next_status
  where id = target_id
    and role = 'manager';
end;
$$;

revoke all on function public.set_manager_status(uuid, text) from public;
grant execute on function public.set_manager_status(uuid, text) to authenticated;

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
grant update (name, phone, student_no, department, grade, desired_job)
  on public.profiles to authenticated;

create policy "profiles_manager_select"
  on public.profiles for select
  to authenticated
  using (public.is_approved_manager());

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

create policy "recruitments_select_relevant"
  on public.internship_recruitments for select
  to authenticated
  using (
    is_visible_to_students
    or public.is_admin()
    or public.is_approved_manager()
  );

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

create policy "companies_manager_all"
  on public.companies for all
  to authenticated
  using (public.is_approved_manager())
  with check (public.is_approved_manager());

create policy "recruitments_manager_all"
  on public.internship_recruitments for all
  to authenticated
  using (public.is_approved_manager())
  with check (public.is_approved_manager());

create policy "applications_manager_all"
  on public.applications for all
  to authenticated
  using (public.is_approved_manager())
  with check (public.is_approved_manager());

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

create unique index if not exists matchings_session_student_idx
  on public.matchings (session_id, student_id);

create or replace function public.notify_application_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.notifications (user_id, title, message, type)
    values (new.student_id, '지원 상태 변경', '인턴십 지원 상태가 ' || new.status || '(으)로 변경되었습니다.', 'application');
  end if;
  return new;
end;
$$;

drop trigger if exists on_application_status_changed on public.applications;
create trigger on_application_status_changed
  after update on public.applications
  for each row execute procedure public.notify_application_status();

create or replace function public.notify_consultation_answer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if old.status is distinct from new.status and new.status = 'answered' then
    insert into public.notifications (user_id, title, message, type)
    values (new.student_id, '상담 답변 등록', '요청한 상담에 답변이 등록되었습니다.', 'consultation');
  end if;
  return new;
end;
$$;

drop trigger if exists on_consultation_answered on public.consultations;
create trigger on_consultation_answered
  after update on public.consultations
  for each row execute procedure public.notify_consultation_answer();

create or replace function public.notify_matching()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (new.student_id, '인턴십 매칭 안내', '기업-학생 매칭 결과가 등록 또는 변경되었습니다.', 'matching');
  return new;
end;
$$;

drop trigger if exists on_matching_saved on public.matchings;
create trigger on_matching_saved
  after insert or update on public.matchings
  for each row execute procedure public.notify_matching();
