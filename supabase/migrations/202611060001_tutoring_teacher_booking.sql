begin;

create function public.teacher_book_tutoring_slot(p_slot_id uuid, p_student_code text) returns void
language plpgsql security definer set search_path = '' as $$
declare target_student uuid;
begin
  if public.tutoring_actor_role() is distinct from 'TEACHER' then
    raise exception 'Chỉ giáo viên được đăng ký hộ học sinh.' using errcode = '42501';
  end if;
  select p.id into target_student from public.profiles p
  where p.student_code = p_student_code and p.role = 'STUDENT'
    and p.is_active = true and p.deleted_at is null
  for share;
  if target_student is null then
    raise exception 'Học sinh không tồn tại hoặc đã ngừng hoạt động.' using errcode = 'P0001';
  end if;
  update public.tutoring_slots set student_id = target_student, booked_at = now()
  where id = p_slot_id and student_id is null and is_active
    and (slot_date + start_time) > (clock_timestamp() at time zone 'Asia/Ho_Chi_Minh');
  if not found then
    raise exception 'Ca đã được đặt, đã khóa hoặc đã qua giờ bắt đầu.' using errcode = 'P0001';
  end if;
exception when unique_violation then
  raise exception 'Học sinh đã đăng ký một ca trong tháng này.' using errcode = 'P0001';
end;
$$;

revoke all on function public.teacher_book_tutoring_slot(uuid, text) from public, anon;
grant execute on function public.teacher_book_tutoring_slot(uuid, text) to authenticated, service_role;

commit;
