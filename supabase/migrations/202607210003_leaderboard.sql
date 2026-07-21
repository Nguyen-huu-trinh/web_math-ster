create or replace view public.v_leaderboard as

select

    p.id,

    p.student_code,

    p.full_name,

    avg(a.score)::numeric(5,2) as average_score,

    count(a.id) as total_exam,

    max(a.score) as highest_score

from profiles p

join exam_attempts a

on a.student_id=p.id

where p.role='STUDENT'

group by

p.id,

p.student_code,

p.full_name;

create or replace view public.v_latest_exam_leaderboard as

select

e.id as exam_id,

e.title,

p.id as student_id,

p.student_code,

p.full_name,

a.score,

dense_rank()

over(

partition by e.id

order by a.score desc

) as ranking

from exam_attempts a

join exams e

on e.id=a.exam_id

join profiles p

on p.id=a.student_id

where

a.submitted_at=(

select

max(submitted_at)

from exam_attempts

);