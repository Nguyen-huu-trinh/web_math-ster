-- Equal positions retain the previous creation-time ordering.
alter table public.courses
  add column course_order integer not null default 0
  check (course_order >= 0);

create index idx_courses_order on public.courses(course_order, created_at, id)
  where deleted_at is null;

-- Soft deletion is an UPDATE; students must never be allowed to mutate courses.
create policy courses_teacher_insert on public.courses
for insert to authenticated
with check (exists (
  select 1 from public.profiles p
  where p.id = auth.uid() and p.role = 'TEACHER'
));

create policy courses_teacher_update on public.courses
for update to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = auth.uid() and p.role = 'TEACHER'
))
with check (exists (
  select 1 from public.profiles p
  where p.id = auth.uid() and p.role = 'TEACHER'
));
