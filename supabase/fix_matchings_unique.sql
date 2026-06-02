-- Run this file once in the Supabase SQL Editor for an existing database.
-- It enables stable one-row-per-student matching per internship session.

create unique index if not exists matchings_session_student_idx
  on public.matchings (session_id, student_id);
