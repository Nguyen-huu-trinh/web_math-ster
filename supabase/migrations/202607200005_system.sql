-- =========================================================
-- SYSTEM MODULE
-- =========================================================

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create table public.notifications (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    title text not null,

    content text not null,

    is_read boolean default false,

    created_at timestamptz default now()

);

create index idx_notifications_user
on public.notifications(user_id);

create index idx_notifications_read
on public.notifications(is_read);

-- =========================================================
-- USER SETTINGS
-- =========================================================

create table public.user_settings (

    user_id uuid primary key
        references public.profiles(id)
        on delete cascade,

    theme varchar(20) default 'system',

    language varchar(10) default 'vi',

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

-- =========================================================
-- SYSTEM CONFIG
-- =========================================================

create table public.system_configs (

    config_key varchar(100) primary key,

    config_value text,

    updated_at timestamptz default now()

);

insert into public.system_configs
(config_key,config_value)
values
('soft_delete_days','7'),
('countdown_date','2027-06-26'),
('max_excel_import','1000'),
('allow_signup','false');

-- =========================================================
-- FILE LINKS
-- =========================================================

create table public.file_links (

    id uuid primary key default gen_random_uuid(),

    title text,

    url text not null,

    provider varchar(30),

    created_by uuid
        references public.profiles(id)
        on delete set null,

    created_at timestamptz default now()

);

-- =========================================================
-- UPDATE TIMESTAMP
-- =========================================================

create trigger trg_user_settings_updated_at
before update
on public.user_settings
for each row
execute procedure public.update_updated_at();

-- =========================================================
-- RLS
-- =========================================================

alter table public.notifications
enable row level security;

alter table public.user_settings
enable row level security;

alter table public.system_configs
enable row level security;

alter table public.file_links
enable row level security;

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create policy notifications_select
on public.notifications
for select
using (

user_id = auth.uid()

);

create policy notifications_update
on public.notifications
for update
using (

user_id = auth.uid()

);

-- =========================================================
-- USER SETTINGS
-- =========================================================

create policy user_settings_select
on public.user_settings
for select
using (

user_id = auth.uid()

);

create policy user_settings_update
on public.user_settings
for update
using (

user_id = auth.uid()

);

create policy user_settings_insert
on public.user_settings
for insert
with check (

user_id = auth.uid()

);

-- =========================================================
-- SYSTEM CONFIG
-- =========================================================

create policy system_configs_select
on public.system_configs
for select
to authenticated
using (true);

-- =========================================================
-- FILE LINKS
-- =========================================================

create policy file_links_select
on public.file_links
for select
to authenticated
using (true);

-- =========================================================
-- FUNCTION: UPDATE ATTENDANCE RESULT
-- =========================================================

create or replace function public.update_attendance_result(
    p_exam uuid,
    p_student uuid
)
returns void
language plpgsql
as
$$
declare
    v_score numeric;
    v_attempt uuid;
    v_min_score numeric;
begin

    select
        max(score)
    into
        v_score
    from public.exam_attempts
    where exam_id=p_exam
    and student_id=p_student;

    select
        id
    into
        v_attempt
    from public.exam_attempts
    where exam_id=p_exam
    and student_id=p_student
    order by score desc
    limit 1;

    select attendance_min_score
    into v_min_score
    from public.exams
    where id=p_exam;

    insert into public.attendance_results(

        exam_id,
        student_id,
        best_attempt_id,
        best_score,
        is_passed,
        passed_at

    )

    values(

        p_exam,
        p_student,
        v_attempt,
        coalesce(v_score,0),
        coalesce(v_score,0)>=coalesce(v_min_score,0),
        case
            when coalesce(v_score,0)>=coalesce(v_min_score,0)
            then now()
        end

    )

    on conflict(exam_id,student_id)

    do update

    set

    best_attempt_id=excluded.best_attempt_id,
    best_score=excluded.best_score,
    is_passed=excluded.is_passed,
    passed_at=excluded.passed_at,
    updated_at=now();

end;
$$;

-- =========================================================
-- FUNCTION: UPDATE PERIODIC RESULT
-- =========================================================

create or replace function public.update_periodic_result(
    p_exam uuid,
    p_student uuid
)
returns void
language plpgsql
as
$$
declare
    v_score numeric;
    v_attempt uuid;
    v_total integer;
begin

    select
        max(score)
    into
        v_score
    from public.exam_attempts
    where exam_id=p_exam
    and student_id=p_student;

    select
        count(*)
    into
        v_total
    from public.exam_attempts
    where exam_id=p_exam
    and student_id=p_student;

    select
        id
    into
        v_attempt
    from public.exam_attempts
    where exam_id=p_exam
    and student_id=p_student
    order by score desc
    limit 1;

    insert into public.periodic_results(

        exam_id,
        student_id,
        best_attempt_id,
        highest_score,
        total_attempts

    )

    values(

        p_exam,
        p_student,
        v_attempt,
        coalesce(v_score,0),
        v_total

    )

    on conflict(exam_id,student_id)

    do update

    set

    best_attempt_id=excluded.best_attempt_id,
    highest_score=excluded.highest_score,
    total_attempts=excluded.total_attempts,
    updated_at=now();

end;
$$;