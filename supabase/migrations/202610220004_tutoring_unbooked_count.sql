begin;
create function public.teacher_tutoring_unbooked_count(p_month text) returns bigint
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.tutoring_actor_role() is distinct from 'TEACHER' then
    raise exception 'Chỉ giáo viên được xem thống kê.' using errcode = '42501';
  end if;
  if p_month is null or p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'Tháng không hợp lệ.' using errcode = '22023';
  end if;
  return (select count(*) from public.profiles p
    where p.role = 'STUDENT' and p.is_active = true and p.deleted_at is null
      and not exists (select 1 from public.tutoring_slots s
        where s.student_id = p.id and s.month_key = p_month));
end;
$$;
revoke all on function public.teacher_tutoring_unbooked_count(text) from public, anon;
grant execute on function public.teacher_tutoring_unbooked_count(text) to authenticated, service_role;
commit;
