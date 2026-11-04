begin;

-- Preserve existing columns and permissions; append the latest submission.
create or replace view public.v_student_dashboard as
select
  p.id as student_id,
  p.full_name,
  (
    select count(*)
    from course_students cs
    join courses c on c.id = cs.course_id
    where cs.student_id = p.id and c.deleted_at is null
  ) as total_courses,
  (
    select count(*)
    from lessons l
    join chapters ch on ch.id = l.chapter_id
    join course_students cs on cs.course_id = ch.course_id
    join courses c on c.id = ch.course_id
    where cs.student_id = p.id and c.deleted_at is null
  ) as total_lessons,
  (
    select count(*) from lesson_progress lp
    where lp.student_id = p.id and lp.is_completed = true
  ) as completed_lessons,
  (
    select count(*)
    from exams e
    join course_students cs on cs.course_id = e.course_id
    join courses c on c.id = e.course_id
    where cs.student_id = p.id
      and c.deleted_at is null
      and e.is_active = true
      and not exists (
        select 1 from exam_attempts ea
        where ea.exam_id = e.id and ea.student_id = p.id
      )
  ) as pending_exams,
  coalesce((
    select round(avg(ea.score), 2)
    from exam_attempts ea
    join exams e on e.id = ea.exam_id
    where ea.student_id = p.id and e.category = 'PERIODIC'::exam_category
  ), 0::numeric) as average_periodic_score,
  p.learning_goal,
  (
    select count(distinct ea.exam_id) from exam_attempts ea
    where ea.student_id = p.id and ea.is_passed = true
  ) as passed_exercises,
  (
    select count(*) from (
      select ea.exam_id from exam_attempts ea
      where ea.student_id = p.id
      group by ea.exam_id
      having bool_and(ea.is_passed = false)
    ) failed_exams
  ) as failed_exercises,
  (
    select max(ea.submitted_at) from exam_attempts ea
    where ea.student_id = p.id
  ) as last_submitted_at
from profiles p
where p.role = 'STUDENT'::user_role;

commit;
