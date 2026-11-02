begin;

-- Same population as teacher_tutoring_unbooked_count; expose only code and name.
-- A JSON array avoids truncating the list at the API's default row limit.
create function public.teacher_tutoring_unbooked_students(p_month text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.tutoring_actor_role() is distinct from 'TEACHER' then
    raise exception 'Chỉ giáo viên được xem danh sách này.' using errcode = '42501';
  end if;
  if p_month is null or p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'Tháng không hợp lệ.' using errcode = '22023';
  end if;
  return (select coalesce(jsonb_agg(
    jsonb_build_object('student_code', p.student_code, 'full_name', p.full_name)
    order by p.student_code, p.full_name), '[]'::jsonb)
    from public.profiles p
    where p.role = 'STUDENT' and p.is_active = true and p.deleted_at is null
      and not exists (select 1 from public.tutoring_slots s
        where s.student_id = p.id and s.month_key = p_month));
end;
$$;

revoke all on function public.teacher_tutoring_unbooked_students(text) from public, anon;
grant execute on function public.teacher_tutoring_unbooked_students(text) to authenticated, service_role;

commit;
