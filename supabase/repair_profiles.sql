-- Run this file in the Supabase SQL Editor when auth.users accounts exist
-- without matching public.profiles rows. It is safe to run more than once.

alter table public.profiles
  add column if not exists phone text;

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

update public.profiles
set role = 'admin', manager_status = null
where lower(email) = 'imsangjun@gmail.com';
