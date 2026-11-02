begin;

create or replace function public.cancel_tutoring_slot(p_slot_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare starts_at timestamp;
begin
  if public.tutoring_actor_role() is distinct from 'STUDENT' then
    raise exception 'Chỉ học sinh được hủy đăng ký của mình.' using errcode = '42501';
  end if;

  -- Lock the owned booking before checking the deadline to prevent stale writes.
  select slot_date + start_time into starts_at
  from public.tutoring_slots
  where id = p_slot_id and student_id = auth.uid()
  for update;
  if not found then
    raise exception 'Không thể hủy ca này.' using errcode = 'P0001';
  end if;
  if starts_at <= (clock_timestamp() at time zone 'Asia/Ho_Chi_Minh') + interval '7 days' then
    raise exception 'Không được hủy đăng ký khi còn 7 ngày hoặc ít hơn đến giờ dò bài.' using errcode = 'P0001';
  end if;

  update public.tutoring_slots set student_id = null, booked_at = null
  where id = p_slot_id and student_id = auth.uid();
end;
$$;

revoke all on function public.cancel_tutoring_slot(uuid) from public, anon;
grant execute on function public.cancel_tutoring_slot(uuid) to authenticated, service_role;

commit;
