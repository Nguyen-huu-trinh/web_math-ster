begin;
drop trigger if exists broadcast_exam_created on public.exams;
drop trigger if exists broadcast_material_saved on public.lesson_contents;
drop function if exists public.broadcast_learning_notification();
alter table public.notifications add column if not exists subtype text;
alter table public.notifications add column if not exists request_id uuid;
create unique index if not exists notifications_request_unique on public.notifications(request_id) where request_id is not null;
create or replace function public.notify_exam_opened() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.status::text='OPEN' and new.is_active is true
 and not (old.status::text='OPEN' and old.is_active is true) then
 insert into public.notifications(title,content,type,subtype,link)
 values (
 case when new.category::text='ATTENDANCE' then 'Bài tập điểm danh mới' else 'Bài kiểm tra định kì mới' end,
 new.title || ' đã được mở, hãy vào làm bài ngay!' || case when new.category::text='PERIODIC' and nullif(trim(new.description),'') is not null then E'\nKiến thức bao gồm: ' || new.description else '' end,
 'EXAM',new.category::text,'/student-exams/open/' || new.id::text);
 end if;
 return new;
end $$;
revoke all on function public.notify_exam_opened() from public, anon, authenticated;
drop trigger if exists broadcast_exam_opened on public.exams;
create trigger broadcast_exam_opened after update of status,is_active on public.exams for each row execute function public.notify_exam_opened();
-- Explicit, authenticated teacher action. No automatic material trigger.
create or replace function public.publish_material_notification(resource_id uuid, submission_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare material record; result uuid; label text;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role::text in ('TEACHER','ADMIN') and is_active is distinct from false) then
 raise exception 'Forbidden' using errcode='42501'; end if;
 if submission_id is null then raise exception 'Missing submission ID'; end if;
 select lc.title,lc.type,l.title as lesson_title,l.id as lesson_id,c.id as chapter_id,c.course_id into material
 from public.lesson_contents lc join public.lessons l on l.id=lc.lesson_id join public.chapters c on c.id=l.chapter_id where lc.id=resource_id;
 if not found then raise exception 'Resource not found' using errcode='P0002'; end if;
 label := case material.type::text when 'VIDEO' then 'Video' when 'PDF' then 'PDF' when 'EXAM' then 'Đề luyện tập' else 'Bài giảng' end;
 insert into public.notifications(title,content,type,subtype,link,request_id)
 values ('Tài liệu học tập mới',material.lesson_title || ' đã được thêm tài liệu ' || label || ' ''' || material.title || '''. Hãy vào học ngay!',
 'LESSON_MATERIAL',material.type::text,'/courses?courseId=' || material.course_id::text || '&chapterId=' || material.chapter_id::text || '&lessonId=' || material.lesson_id::text,submission_id)
 on conflict (request_id) where request_id is not null do nothing returning id into result;
 if result is null then select id into result from public.notifications where request_id=submission_id; end if;
 return result;
end $$;
revoke all on function public.publish_material_notification(uuid,uuid) from public,anon;
grant execute on function public.publish_material_notification(uuid,uuid) to authenticated;
create or replace function public.get_notification_feed() returns jsonb
language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at desc,n.id desc) from (
 select n.id,n.title,n.content,n.type,n.subtype,n.link,n.created_at,exists(select 1 from public.notification_reads r where r.notification_id=n.id and r.user_id=(select auth.uid())) as is_read
 from public.notifications n order by n.created_at desc,n.id desc limit 20
 ) n),'[]'::jsonb),'unreadCount',(select count(*) from public.notifications n where not exists(select 1 from public.notification_reads r where r.notification_id=n.id and r.user_id=(select auth.uid()))));
$$;
commit;
