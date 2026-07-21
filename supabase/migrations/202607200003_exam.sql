-- =========================================================
-- EXAM MODULE
-- =========================================================

create type public.exam_type as enum (
    'FREE',
    'MOET'
);

create type public.exam_category as enum (
    'ATTENDANCE',
    'PERIODIC'
);

create type public.exam_status as enum (
    'OPEN',
    'LOCKED'
);

create type public.question_type as enum (
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'SHORT_ANSWER'
);

create type public.option_type as enum (
    'A',
    'B',
    'C',
    'D',
    'TRUE_FALSE_1',
    'TRUE_FALSE_2',
    'TRUE_FALSE_3',
    'TRUE_FALSE_4',
    'SHORT_ANSWER'
);

-- =========================================================
-- EXAMS
-- =========================================================

create table public.exams (

    id uuid primary key default gen_random_uuid(),

    course_id uuid
        references public.courses(id)
        on delete set null,

    created_by uuid
        references public.profiles(id)
        on delete set null,

    title text not null,

    description text,

    exam_file_url text not null,

    exam_type public.exam_type not null,

    category public.exam_category not null,

    status public.exam_status not null default 'OPEN',

    show_answer boolean not null default false,

    duration_minutes integer not null,

    max_attempts integer,

    attendance_min_score numeric(5,2),

    start_at timestamptz,

    end_at timestamptz,

    is_active boolean default true,

    deleted_at timestamptz,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

create index idx_exam_course
on public.exams(course_id);

create index idx_exam_category
on public.exams(category);

create index idx_exam_status
on public.exams(status);

-- =========================================================
-- EXAM SECTIONS
-- =========================================================

create table public.exam_sections (

    id uuid primary key default gen_random_uuid(),

    exam_id uuid not null
        references public.exams(id)
        on delete cascade,

    title text not null,

    question_type public.question_type not null,

    total_questions integer not null,

    total_score numeric(5,2) not null,

    order_index integer not null,

    created_at timestamptz default now()

);

create index idx_exam_sections_exam
on public.exam_sections(exam_id);

-- =========================================================
-- QUESTIONS
-- =========================================================

create table public.exam_questions (

    id uuid primary key default gen_random_uuid(),

    exam_section_id uuid not null
        references public.exam_sections(id)
        on delete cascade,

    question_number integer not null,

    score numeric(5,2) not null,

    correct_answer jsonb not null,

    created_at timestamptz default now(),

    updated_at timestamptz default now(),

    unique(exam_section_id,question_number)

);

create index idx_questions_section
on public.exam_questions(exam_section_id);

-- =========================================================
-- QUESTION OPTIONS
-- =========================================================

create table public.exam_question_options (

    id uuid primary key default gen_random_uuid(),

    question_id uuid not null
        references public.exam_questions(id)
        on delete cascade,

    option_key public.option_type not null,

    option_label text,

    is_correct boolean default false,

    order_index integer default 1,

    created_at timestamptz default now(),

    unique(question_id,option_key)

);

create index idx_question_options_question
on public.exam_question_options(question_id);

-- =========================================================
-- ATTEMPTS
-- =========================================================

create table public.exam_attempts (

    id uuid primary key default gen_random_uuid(),

    exam_id uuid not null
        references public.exams(id)
        on delete cascade,

    student_id uuid not null
        references public.profiles(id)
        on delete cascade,

    attempt_number integer not null,

    started_at timestamptz default now(),

    submitted_at timestamptz,

    score numeric(5,2),

    passed boolean,

    duration_seconds integer,

    created_at timestamptz default now(),

    updated_at timestamptz default now(),

    unique(exam_id,student_id,attempt_number)

);

create index idx_attempt_exam
on public.exam_attempts(exam_id);

create index idx_attempt_student
on public.exam_attempts(student_id);

-- =========================================================
-- ANSWERS
-- =========================================================

create table public.exam_answers (

    id uuid primary key default gen_random_uuid(),

    attempt_id uuid not null
        references public.exam_attempts(id)
        on delete cascade,

    question_id uuid not null
        references public.exam_questions(id)
        on delete cascade,

    answer jsonb not null,

    score numeric(5,2) default 0,

    is_correct boolean,

    created_at timestamptz default now(),

    updated_at timestamptz default now(),

    unique(attempt_id,question_id)

);

create index idx_answers_attempt
on public.exam_answers(attempt_id);

create index idx_answers_question
on public.exam_answers(question_id);

-- =========================================================
-- UPDATE TIMESTAMP
-- =========================================================

create trigger trg_exam_updated_at
before update
on public.exams
for each row
execute procedure public.update_updated_at();

create trigger trg_exam_questions_updated_at
before update
on public.exam_questions
for each row
execute procedure public.update_updated_at();

create trigger trg_exam_attempts_updated_at
before update
on public.exam_attempts
for each row
execute procedure public.update_updated_at();

create trigger trg_exam_answers_updated_at
before update
on public.exam_answers
for each row
execute procedure public.update_updated_at();

-- =========================================================
-- RLS
-- =========================================================

alter table public.exams enable row level security;
alter table public.exam_sections enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_question_options enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;

-- =========================================================
-- EXAMS
-- =========================================================

create policy exams_select
on public.exams
for select
to authenticated
using (true);

-- =========================================================
-- EXAM SECTIONS
-- =========================================================

create policy exam_sections_select
on public.exam_sections
for select
to authenticated
using (true);

-- =========================================================
-- QUESTIONS
-- =========================================================

create policy exam_questions_select
on public.exam_questions
for select
to authenticated
using (true);

-- =========================================================
-- QUESTION OPTIONS
-- =========================================================

create policy exam_question_options_select
on public.exam_question_options
for select
to authenticated
using (true);

-- =========================================================
-- ATTEMPTS
-- =========================================================

create policy exam_attempts_select
on public.exam_attempts
for select
using (

student_id = auth.uid()

or exists (

select 1
from public.profiles p
where p.id = auth.uid()
and p.role in ('ADMIN','TEACHER')

)

);

create policy exam_attempts_insert
on public.exam_attempts
for insert
with check (

student_id = auth.uid()

);

create policy exam_attempts_update
on public.exam_attempts
for update
using (

student_id = auth.uid()

);

-- =========================================================
-- ANSWERS
-- =========================================================

create policy exam_answers_select
on public.exam_answers
for select
using (

exists (

select 1
from public.exam_attempts ea
where ea.id = attempt_id
and (

ea.student_id = auth.uid()

or exists (

select 1
from public.profiles p
where p.id = auth.uid()
and p.role in ('ADMIN','TEACHER')

)

)

)

);

create policy exam_answers_insert
on public.exam_answers
for insert
with check (

exists (

select 1
from public.exam_attempts ea
where ea.id = attempt_id
and ea.student_id = auth.uid()

)

);

create policy exam_answers_update
on public.exam_answers
for update
using (

exists (

select 1
from public.exam_attempts ea
where ea.id = attempt_id
and ea.student_id = auth.uid()

)

);