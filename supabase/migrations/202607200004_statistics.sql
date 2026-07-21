-- =========================================================
-- STATISTICS MODULE
-- =========================================================

-- =========================================================
-- ATTENDANCE RESULTS
-- =========================================================

create table public.attendance_results (

    id uuid primary key default gen_random_uuid(),

    exam_id uuid not null
        references public.exams(id)
        on delete cascade,

    student_id uuid not null
        references public.profiles(id)
        on delete cascade,

    best_attempt_id uuid
        references public.exam_attempts(id)
        on delete set null,

    best_score numeric(5,2) not null default 0,

    is_passed boolean not null default false,

    passed_at timestamptz,

    created_at timestamptz default now(),

    updated_at timestamptz default now(),

    unique(exam_id,student_id)

);

create index idx_attendance_student
on public.attendance_results(student_id);

create index idx_attendance_exam
on public.attendance_results(exam_id);

-- =========================================================
-- PERIODIC RESULTS
-- =========================================================

create table public.periodic_results (

    id uuid primary key default gen_random_uuid(),

    exam_id uuid not null
        references public.exams(id)
        on delete cascade,

    student_id uuid not null
        references public.profiles(id)
        on delete cascade,

    best_attempt_id uuid
        references public.exam_attempts(id)
        on delete set null,

    highest_score numeric(5,2) default 0,

    total_attempts integer default 0,

    created_at timestamptz default now(),

    updated_at timestamptz default now(),

    unique(exam_id,student_id)

);

create index idx_periodic_student
on public.periodic_results(student_id);

create index idx_periodic_exam
on public.periodic_results(exam_id);

-- =========================================================
-- STUDENT STATISTICS
-- =========================================================

create table public.student_statistics (

    student_id uuid primary key
        references public.profiles(id)
        on delete cascade,

    lessons_completed integer default 0,

    attendance_completed integer default 0,

    attendance_passed integer default 0,

    periodic_exam_count integer default 0,

    periodic_average numeric(5,2) default 0,

    periodic_total_score numeric(8,2) default 0,

    last_periodic_score numeric(5,2),

    updated_at timestamptz default now()

);

-- =========================================================
-- RANKINGS CACHE
-- =========================================================

create table public.rankings_cache (

    id uuid primary key default gen_random_uuid(),

    ranking_type varchar(30) not null,

    student_id uuid not null
        references public.profiles(id)
        on delete cascade,

    total_score numeric(8,2) default 0,

    average_score numeric(5,2) default 0,

    last_exam_score numeric(5,2) default 0,

    rank_position integer not null,

    updated_at timestamptz default now()

);

create index idx_ranking_type
on public.rankings_cache(ranking_type);

create index idx_ranking_student
on public.rankings_cache(student_id);

-- =========================================================
-- UPDATE TIMESTAMP
-- =========================================================

create trigger trg_attendance_results_updated_at
before update
on public.attendance_results
for each row
execute procedure public.update_updated_at();

create trigger trg_periodic_results_updated_at
before update
on public.periodic_results
for each row
execute procedure public.update_updated_at();

create trigger trg_student_statistics_updated_at
before update
on public.student_statistics
for each row
execute procedure public.update_updated_at();

-- =========================================================
-- RLS
-- =========================================================

alter table public.attendance_results enable row level security;
alter table public.periodic_results enable row level security;
alter table public.student_statistics enable row level security;
alter table public.rankings_cache enable row level security;

create policy attendance_results_select
on public.attendance_results
for select
using (

student_id = auth.uid()

or exists(

select 1
from public.profiles p
where p.id=auth.uid()
and p.role in ('ADMIN','TEACHER')

)

);

create policy periodic_results_select
on public.periodic_results
for select
using (

student_id = auth.uid()

or exists(

select 1
from public.profiles p
where p.id=auth.uid()
and p.role in ('ADMIN','TEACHER')

)

);

create policy student_statistics_select
on public.student_statistics
for select
using (

student_id = auth.uid()

or exists(

select 1
from public.profiles p
where p.id=auth.uid()
and p.role in ('ADMIN','TEACHER')

)

);

create policy rankings_cache_select
on public.rankings_cache
for select
to authenticated
using (true);