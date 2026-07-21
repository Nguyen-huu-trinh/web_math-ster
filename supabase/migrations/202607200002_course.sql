-- =========================================================
-- COURSE MODULE
-- =========================================================

create type public.lesson_content_type as enum (
    'VIDEO',
    'PDF',
    'EXAM'
);

-- =========================================================
-- COURSES
-- =========================================================

create table public.courses (

    id uuid primary key default gen_random_uuid(),

    name text not null,

    description text,

    thumbnail_url text,

    is_active boolean not null default true,

    deleted_at timestamptz,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);

create index idx_courses_active
on public.courses(is_active);

-- =========================================================
-- COURSE STUDENTS
-- =========================================================

create table public.course_students (

    course_id uuid not null
        references public.courses(id)
        on delete cascade,

    student_id uuid not null
        references public.profiles(id)
        on delete cascade,

    created_at timestamptz default now(),

    primary key(course_id,student_id)

);

create index idx_course_students_student
on public.course_students(student_id);

-- =========================================================
-- CHAPTERS
-- =========================================================

create table public.chapters (

    id uuid primary key default gen_random_uuid(),

    course_id uuid not null
        references public.courses(id)
        on delete cascade,

    title text not null,

    order_index integer not null,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index idx_chapters_course
on public.chapters(course_id);

-- =========================================================
-- LESSONS
-- =========================================================

create table public.lessons (

    id uuid primary key default gen_random_uuid(),

    chapter_id uuid not null
        references public.chapters(id)
        on delete cascade,

    title text not null,

    order_index integer not null,

    is_active boolean default true,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index idx_lessons_chapter
on public.lessons(chapter_id);

-- =========================================================
-- LESSON CONTENTS
-- =========================================================

create table public.lesson_contents (

    id uuid primary key default gen_random_uuid(),

    lesson_id uuid not null
        references public.lessons(id)
        on delete cascade,

    type public.lesson_content_type not null,

    title text not null,

    url text not null,

    order_index integer not null,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index idx_lesson_contents_lesson
on public.lesson_contents(lesson_id);

-- =========================================================
-- LESSON PROGRESS
-- =========================================================

create table public.lesson_progress (

    lesson_id uuid not null
        references public.lessons(id)
        on delete cascade,

    student_id uuid not null
        references public.profiles(id)
        on delete cascade,

    is_completed boolean default false,

    completed_at timestamptz,

    created_at timestamptz default now(),

    updated_at timestamptz default now(),

    primary key(lesson_id,student_id)

);

create index idx_progress_student
on public.lesson_progress(student_id);

create index idx_progress_completed
on public.lesson_progress(is_completed);

-- =========================================================
-- UPDATED AT TRIGGERS
-- =========================================================

create trigger trg_courses_updated_at
before update
on public.courses
for each row
execute procedure public.update_updated_at();

create trigger trg_chapters_updated_at
before update
on public.chapters
for each row
execute procedure public.update_updated_at();

create trigger trg_lessons_updated_at
before update
on public.lessons
for each row
execute procedure public.update_updated_at();

create trigger trg_lesson_contents_updated_at
before update
on public.lesson_contents
for each row
execute procedure public.update_updated_at();

create trigger trg_lesson_progress_updated_at
before update
on public.lesson_progress
for each row
execute procedure public.update_updated_at();

-- =========================================================
-- RLS
-- =========================================================

alter table public.courses enable row level security;
alter table public.course_students enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_contents enable row level security;
alter table public.lesson_progress enable row level security;

-- =========================================================
-- COURSES
-- =========================================================

create policy "courses_select"

on public.courses

for select

to authenticated

using (true);

-- =========================================================
-- COURSE STUDENTS
-- =========================================================

create policy "course_students_select"

on public.course_students

for select

to authenticated

using (

student_id=auth.uid()

or

exists(

select 1
from public.profiles p
where p.id=auth.uid()
and p.role in ('ADMIN','TEACHER')

)

);

-- =========================================================
-- CHAPTERS
-- =========================================================

create policy "chapters_select"

on public.chapters

for select

to authenticated

using (true);

-- =========================================================
-- LESSONS
-- =========================================================

create policy "lessons_select"

on public.lessons

for select

to authenticated

using (true);

-- =========================================================
-- LESSON CONTENTS
-- =========================================================

create policy "lesson_contents_select"

on public.lesson_contents

for select

to authenticated

using (true);

-- =========================================================
-- LESSON PROGRESS
-- =========================================================

create policy "lesson_progress_select"

on public.lesson_progress

for select

using (

student_id=auth.uid()

or

exists(

select 1
from public.profiles p
where p.id=auth.uid()
and p.role in ('ADMIN','TEACHER')

)

);

create policy "lesson_progress_insert"

on public.lesson_progress

for insert

with check (

student_id=auth.uid()

);

create policy "lesson_progress_update"

on public.lesson_progress

for update

using (

student_id=auth.uid()

);