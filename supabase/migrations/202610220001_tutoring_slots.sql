begin;

create table public.tutoring_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null check (slot_date between date '0001-01-01' and date '9999-12-31'),
  start_time time not null,
  end_time time,
  -- to_char(date, text) is STABLE, so cannot be used in a generated expression.
  month_key varchar(7) generated always as (
    lpad(extract(year from slot_date)::text, 4, '0') || '-' ||
    lpad(extract(month from slot_date)::text, 2, '0')
  ) stored,
  student_id uuid references public.profiles(id) on delete set null,
  booked_at timestamptz,
  is_active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  constraint tutoring_slots_time_order check (end_time is null or end_time > start_time),
  constraint tutoring_slots_date_time_key unique (slot_date, start_time),
  constraint tutoring_slots_student_month_key unique (student_id, month_key)
);
-- The two UNIQUE constraints already create indexes on the requested column pairs.
alter table public.tutoring_slots enable row level security;
revoke all on public.tutoring_slots from anon;
grant select, insert, update, delete on public.tutoring_slots to authenticated;
grant all on public.tutoring_slots to service_role;

create function public.tutoring_actor_role() returns text
language sql stable security definer set search_path = '' as $$
  select p.role::text from public.profiles p
  where p.id = auth.uid() and p.is_active = true and p.deleted_at is null
$$;
revoke all on function public.tutoring_actor_role() from public, anon;
grant execute on function public.tutoring_actor_role() to authenticated, service_role;

create policy tutoring_teacher on public.tutoring_slots for all to authenticated
using (public.tutoring_actor_role() = 'TEACHER')
with check (public.tutoring_actor_role() = 'TEACHER');
create policy tutoring_student_own on public.tutoring_slots for select to authenticated
using (public.tutoring_actor_role() = 'STUDENT' and student_id = auth.uid());

-- Other students' identities and notes on inactive slots are never exposed.
create function public.list_tutoring_slots(p_month text)
returns table (id uuid, slot_date date, start_time time, end_time time,
  month_key varchar, student_id uuid, booked_at timestamptz, is_active boolean,
  note text, is_booked boolean, student_name text)
language plpgsql stable security definer set search_path = '' as $$
declare actor text := public.tutoring_actor_role();
begin
  if actor is null or actor not in ('TEACHER', 'STUDENT') then
    raise exception 'Không có quyền truy cập.' using errcode = '42501';
  end if;
  if p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' or p_month is null then
    raise exception 'Tháng không hợp lệ.' using errcode = '22023';
  end if;
  return query select s.id, s.slot_date, s.start_time, s.end_time, s.month_key,
    case when actor = 'TEACHER' or s.student_id = auth.uid() then s.student_id end,
    case when actor = 'TEACHER' or s.student_id = auth.uid() then s.booked_at end,
    s.is_active, s.note, s.student_id is not null,
    case when actor = 'TEACHER' then p.full_name end
  from public.tutoring_slots s left join public.profiles p on p.id = s.student_id
  where s.month_key = p_month
    and (actor = 'TEACHER' or s.is_active or s.student_id = auth.uid())
  order by s.slot_date, s.start_time;
end;
$$;
revoke all on function public.list_tutoring_slots(text) from public, anon;
grant execute on function public.list_tutoring_slots(text) to authenticated, service_role;

create function public.book_tutoring_slot(p_slot_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.tutoring_actor_role() is distinct from 'STUDENT' then
    raise exception 'Chỉ học sinh được đăng ký.' using errcode = '42501';
  end if;
  -- The conditional UPDATE locks the row; the unique index arbitrates competing
  -- bookings by the same student in different slots of the same month.
  update public.tutoring_slots set student_id = auth.uid(), booked_at = now()
  where id = p_slot_id and student_id is null and is_active
    and (slot_date + start_time) > (clock_timestamp() at time zone 'Asia/Ho_Chi_Minh');
  if not found then
    raise exception 'Ca đã được đặt, đã khóa hoặc đã qua giờ bắt đầu.' using errcode = 'P0001';
  end if;
exception when unique_violation then
  raise exception 'Bạn đã đăng ký một ca trong tháng này.' using errcode = 'P0001';
end;
$$;
revoke all on function public.book_tutoring_slot(uuid) from public, anon;
grant execute on function public.book_tutoring_slot(uuid) to authenticated, service_role;

create function public.cancel_tutoring_slot(p_slot_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.tutoring_actor_role() is distinct from 'STUDENT' then
    raise exception 'Chỉ học sinh được hủy đăng ký của mình.' using errcode = '42501';
  end if;
  update public.tutoring_slots set student_id = null, booked_at = null
  where id = p_slot_id and student_id = auth.uid()
    and (slot_date + start_time) > (clock_timestamp() at time zone 'Asia/Ho_Chi_Minh');
  if not found then
    raise exception 'Không thể hủy ca này.' using errcode = 'P0001';
  end if;
end;
$$;
revoke all on function public.cancel_tutoring_slot(uuid) from public, anon;
grant execute on function public.cancel_tutoring_slot(uuid) to authenticated, service_role;

commit;
