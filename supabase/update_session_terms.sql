-- Run this file once in the Supabase SQL Editor for an existing database.
-- It allows combined internship session terms.

alter table public.internship_sessions
  drop constraint if exists internship_sessions_term_check;

alter table public.internship_sessions
  add constraint internship_sessions_term_check
  check (term in ('1학기', '하계', '하계_2학기', '2학기', '동계', '동계_1학기'));

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
