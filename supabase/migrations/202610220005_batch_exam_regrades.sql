begin;
-- Service-only execution: grading values are calculated by the trusted server.
create function public.apply_exam_regrades(p_exam_id uuid, p_rows jsonb) returns integer
-- Preserve the legacy points RPC's public-schema lookup for unqualified names.
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
    old_passed boolean, new_passed boolean, point_correction integer
  ) order by attempt_id loop
    if r.attempt_id is null or r.student_id is null or r.new_score is null
      or r.new_passed is null or r.point_correction is null then
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
    if r.point_correction <> 0 then
      perform public.adjust_student_points(r.student_id, r.point_correction);
    end if;
    processed := processed + 1;
  end loop;
  return processed;
end;
$$;
revoke all on function public.apply_exam_regrades(uuid, jsonb) from public, anon;
grant execute on function public.apply_exam_regrades(uuid, jsonb) to authenticated, service_role;
commit;
