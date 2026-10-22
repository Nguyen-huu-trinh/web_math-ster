begin;
create function public.bulk_tutoring_slots(p_action text, p_selection jsonb) returns integer
language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  if public.tutoring_actor_role() is distinct from 'TEACHER' then
    raise exception 'Chỉ giáo viên được quản lý ca.' using errcode = '42501';
  end if;
  if p_action is null or p_action not in ('delete', 'lock', 'release')
    or p_selection is null or jsonb_typeof(p_selection) <> 'array' then
    raise exception 'Dữ liệu không hợp lệ.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_selection) not between 1 and 500 then
    raise exception 'Chọn từ 1 đến 500 ca.' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_to_recordset(p_selection) as x(id uuid, student_id uuid) where x.id is null) then
    raise exception 'Thiếu mã ca.' using errcode = '22023';
  end if;
  if p_action = 'delete' then
    delete from public.tutoring_slots s
    using jsonb_to_recordset(p_selection) as x(id uuid, student_id uuid)
    where s.id = x.id and s.student_id is null;
  elsif p_action = 'lock' then
    update public.tutoring_slots s set is_active = false
    from jsonb_to_recordset(p_selection) as x(id uuid, student_id uuid)
    where s.id = x.id;
  else
    update public.tutoring_slots s set student_id = null, booked_at = null
    from jsonb_to_recordset(p_selection) as x(id uuid, student_id uuid)
    where s.id = x.id and s.student_id = x.student_id;
  end if;
  get diagnostics affected = row_count;
  return affected;
end;
$$;
revoke all on function public.bulk_tutoring_slots(text, jsonb) from public, anon;
grant execute on function public.bulk_tutoring_slots(text, jsonb) to authenticated, service_role;
commit;
