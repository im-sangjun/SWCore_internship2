-- Run this file once in the Supabase SQL Editor for an existing database.
-- It prevents one student from being selected more than once in combined terms:
-- (하계, 하계_2학기) and (동계, 동계_1학기).

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
