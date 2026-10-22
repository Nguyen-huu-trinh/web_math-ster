begin;
create function public.teacher_tutoring_slots(p_month text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.tutoring_actor_role() is distinct from 'TEACHER' then
    raise exception 'Chỉ giáo viên được quản lý ca.' using errcode = '42501';
  end if;
  if p_month is null or p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'Tháng không hợp lệ.' using errcode = '22023';
  end if;
  return (select coalesce(jsonb_agg(to_jsonb(s) || jsonb_build_object(
    'is_booked', s.student_id is not null, 'student_name', p.full_name,
    'student_code', p.student_code) order by s.slot_date, s.start_time), '[]'::jsonb)
    from public.tutoring_slots s left join public.profiles p on p.id = s.student_id
    where s.month_key = p_month);
end;
$$;
revoke all on function public.teacher_tutoring_slots(text) from public, anon;
grant execute on function public.teacher_tutoring_slots(text) to authenticated, service_role;
commit;
