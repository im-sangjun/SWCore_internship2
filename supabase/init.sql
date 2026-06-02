create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role text not null check (role in ('admin', 'manager', 'student')),
  student_no text,
  department text,
  grade int,
  desired_job text,
  manager_status text check (manager_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.internship_sessions (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  term text not null check (term in ('1학기', '하계', '2학기', '동계')),
  name text not null,
  is_linked boolean default false,
  linked_session_id uuid references public.internship_sessions(id),
  application_start date,
  application_end date,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'closed', 'matching', 'completed')),
  created_at timestamptz default now()
);

create table public.job_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  business_type text,
  address text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.internship_recruitments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.internship_sessions(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  job_code_id uuid references public.job_codes(id),
  title text not null,
  recruit_count int default 0,
  related_departments text[],
  target_grades int[],
  employment_linked boolean default false,
  description text,
  requirements text,
  status text not null default 'open'
    check (status in ('open', 'closed')),
  created_at timestamptz default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.internship_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  first_recruitment_id uuid references public.internship_recruitments(id),
  second_recruitment_id uuid references public.internship_recruitments(id),
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewing', 'selected', 'rejected', 'canceled')),
  memo text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (session_id, student_id)
);

create table public.matchings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.internship_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  recruitment_id uuid references public.internship_recruitments(id),
  matched_by uuid references public.profiles(id),
  status text not null default 'matched'
    check (status in ('matched', 'confirmed', 'canceled')),
  created_at timestamptz default now()
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  target_role text not null default 'all'
    check (target_role in ('all', 'admin', 'manager', 'student')),
  session_id uuid references public.internship_sessions(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.internship_sessions(id),
  title text not null,
  content text not null,
  status text not null default 'requested'
    check (status in ('requested', 'answered', 'closed')),
  answer text,
  answered_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  answered_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text,
  is_read boolean default false,
  created_at timestamptz default now()
);

insert into public.job_codes (code, name, description, sort_order)
values
  ('AI_DEV', 'AI개발', '인공지능 모델, 데이터 분석, 머신러닝 관련 직무', 1),
  ('SW_DEV', 'SW개발', '웹, 앱, 백엔드, 프론트엔드 개발 직무', 2),
  ('DATA', '데이터분석', '데이터 처리, 시각화, 분석 관련 직무', 3),
  ('SECURITY', '정보보안', '보안 관제, 취약점 분석, 보안 개발 직무', 4),
  ('CLOUD', '클라우드/DevOps', '클라우드 인프라, 배포, 운영 자동화 직무', 5);

insert into public.internship_sessions (year, term, name, status)
values
  (2026, '1학기', '2026년 1학기 SWCore 인턴십', 'draft'),
  (2026, '하계', '2026년 하계 SWCore 인턴십', 'draft'),
  (2026, '2학기', '2026년 2학기 SWCore 인턴십', 'draft'),
  (2026, '동계', '2026년 동계 SWCore 인턴십', 'draft');
