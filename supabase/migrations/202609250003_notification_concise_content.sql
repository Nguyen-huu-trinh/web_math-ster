begin;
alter table public.notifications alter column content drop not null;

create or replace function public.notify_exam_opened() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.status::text='OPEN' and new.is_active is true
 and not (old.status::text='OPEN' and old.is_active is true) then
 insert into public.notifications(title,content,type,subtype,link)
 values (new.title,
 case when new.category::text='PERIODIC' then nullif(trim(new.description),'') else null end,
 'EXAM',new.category::text,'/student-exams/open/' || new.id::text);
 end if;
 return new;
end $$;
revoke all on function public.notify_exam_opened() from public,anon,authenticated;

drop function if exists public.publish_material_notification(uuid,uuid);
create or replace function public.publish_material_notification(resource_id uuid, submission_id uuid, is_update boolean default false) returns uuid
language plpgsql security definer set search_path='' as $$
declare material record; result uuid; label text; material_subtype text;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role::text in ('TEACHER','ADMIN') and is_active is distinct from false) then
 raise exception 'Forbidden' using errcode='42501'; end if;
 if submission_id is null then raise exception 'Missing submission ID'; end if;
 select lc.title,lc.type,l.title as lesson_title,l.id as lesson_id,c.course_id into material
 from public.lesson_contents lc join public.lessons l on l.id=lc.lesson_id join public.chapters c on c.id=l.chapter_id where lc.id=resource_id;
 if not found then raise exception 'Resource not found' using errcode='P0002'; end if;
 material_subtype := case when material.type::text in ('VIDEO','PDF','EXAM') then material.type::text else 'DOCUMENT' end;
 label := case material_subtype when 'VIDEO' then 'video bài giảng' when 'PDF' then 'file PDF' when 'EXAM' then 'đề luyện tập' else 'tài liệu' end;
 insert into public.notifications(title,content,type,subtype,link,request_id)
 values (material.lesson_title,
 (case when is_update then 'Đã cập nhật ' else 'Đã thêm ' end) || label || case when nullif(trim(material.title),'') is not null then ' ' || trim(material.title) else '' end,
 'LESSON_MATERIAL',material_subtype,'/courses/' || material.course_id::text || '/lessons/' || material.lesson_id::text,submission_id)
 on conflict (request_id) where request_id is not null do nothing returning id into result;
 if result is null then select id into result from public.notifications where request_id=submission_id; end if;
 return result;
end $$;
revoke all on function public.publish_material_notification(uuid,uuid,boolean) from public,anon;
grant execute on function public.publish_material_notification(uuid,uuid,boolean) to authenticated;

-- Normalize legacy exam broadcasts using their linked exam; retain read tracking.
update public.notifications n set title=e.title,
 content=case when e.category::text='PERIODIC' then nullif(trim(e.description),'') else null end,
 subtype=e.category::text
from public.exams e
where n.type='EXAM' and n.link='/student-exams/open/' || e.id::text
 and n.title in ('Bài kiểm tra mới','Bài kiểm tra định kì mới','Bài tập điểm danh mới');

-- Legacy broadcasts have no saved create/update flag. Preserve the recorded action
-- instead of guessing it from the resource's current state.
update public.notifications n set title=l.title,
 content=case when n.content like '% đã được thêm tài liệu %' then
 'Đã thêm ' || regexp_replace(split_part(n.content,' đã được thêm tài liệu ',2), '\. Hãy vào học ngay!$', '')
 else n.content end
from public.lessons l join public.chapters c on c.id=l.chapter_id
where n.type='LESSON_MATERIAL' and n.title='Tài liệu học tập mới'
 and (n.link='/courses/' || c.course_id::text || '/lessons/' || l.id::text
 or (n.link like '/courses?%' and substring(n.link from '[?&]lessonId=([^&#]+)')=l.id::text));
commit;
