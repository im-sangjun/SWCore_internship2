-- Run this file once in the Supabase SQL Editor for an existing database.
-- It adds a student contact phone field used by application management popups.

alter table public.profiles
  add column if not exists phone text;

grant update (name, phone, student_no, department, grade, desired_job)
  on public.profiles to authenticated;
