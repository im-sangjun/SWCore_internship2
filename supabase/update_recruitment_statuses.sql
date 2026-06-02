-- Run this file once in the Supabase SQL Editor for an existing database.
-- It allows recruitment rows to use open/reviewing/closed status values.

alter table public.internship_recruitments
  drop constraint if exists internship_recruitments_status_check;

alter table public.internship_recruitments
  add constraint internship_recruitments_status_check
  check (status in ('open', 'reviewing', 'closed'));
