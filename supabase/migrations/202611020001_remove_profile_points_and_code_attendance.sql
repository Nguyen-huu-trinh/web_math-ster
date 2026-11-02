begin;
-- Service-only execution: grading values are calculated by the trusted server.
create or replace function public.apply_exam_regrades(p_exam_id uuid, p_rows jsonb) returns integer
language plpgsql security invoker set search_path = public, pg_temp as $$
declare r record; affected integer; processed integer := 0;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;
  if p_exam_id is null or p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Invalid regrade batch' using errcode = '22023';
  end if;
  if jsonb_array_length(p_rows) not between 1 and 500 then
    raise exception 'Regrade batch must contain 1 to 500 attempts' using errcode = '22023';
  end if;
  for r in select * from jsonb_to_recordset(p_rows) as x(
    attempt_id uuid, student_id uuid, old_score numeric, new_score numeric,
    old_passed boolean, new_passed boolean
  ) order by attempt_id loop
    if r.attempt_id is null or r.student_id is null or r.new_score is null
      or r.new_passed is null then
      raise exception 'Invalid regrade entry' using errcode = '22023';
    end if;
    update public.exam_attempts a set score = r.new_score,
      is_passed = r.new_passed, updated_at = now()
    where a.id = r.attempt_id and a.exam_id = p_exam_id and a.student_id = r.student_id
      and a.score is not distinct from r.old_score
      and a.is_passed is not distinct from r.old_passed;
    get diagnostics affected = row_count;
    if affected <> 1 then
      raise exception 'Attempt changed while regrading. Reload and retry.' using errcode = '40001';
    end if;
    processed := processed + 1;
  end loop;
  return processed;
end;
$$;
revoke all on function public.apply_exam_regrades(uuid, jsonb) from public, anon;
grant execute on function public.apply_exam_regrades(uuid, jsonb) to authenticated, service_role;
-- The code-attendance feature predates the checked-in migrations. Resolve all
-- overloads by signature so this also works on installations without that feature.
do $$
declare item record;
begin
  for item in
    select p.oid::regprocedure as signature
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'adjust_student_points', 'create_attendance_session', 'submit_attendance'
    )
  loop
    execute format('drop function %s', item.signature);
  end loop;
end;
$$;

-- Remove HP-triggered account locking and other dedicated points triggers.
-- Do not change account activation states that have already been stored.
do $$
declare item record;
begin
  for item in
    select t.tgname, p.oid::regprocedure as signature
    from pg_trigger t join pg_proc p on p.oid = t.tgfoid
    where t.tgrelid = 'public.profiles'::regclass and not t.tgisinternal
      and (p.prosrc ~* '\m(new|old)\s*\.\s*points\M'
        or p.proname ~* '(^|_)points?(_|$)')
  loop
    execute format('drop trigger %I on public.profiles', item.tgname);
    -- RESTRICT deliberately stops if another feature shares this function.
    execute format('drop function if exists %s', item.signature);
  end loop;
end;
$$;

drop view if exists public.v_dotrau_students;
drop table if exists public.attendance;
alter table public.profiles drop column if exists points;

-- Reject dangling procedural references: PostgreSQL does not track dependencies
-- inside PL/pgSQL bodies. Unexpected mixed-purpose routines need an explicit edit.
do $$
declare dangling text;
begin
  select string_agg(p.oid::regprocedure::text, ', ') into dangling
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f' and (
    p.prosrc ~* '\m(new|old)\s*\.\s*points\M'
    or (p.prosrc ~* '\mprofiles\M' and p.prosrc ~* '\mpoints\M')
    or p.prosrc ~* '\m(adjust_student_points|create_attendance_session|submit_attendance)\M'
  );
  if dangling is not null then
    raise exception 'Legacy points references remain; update these routines before retrying: %', dangling;
  end if;
end;
$$;
commit;
