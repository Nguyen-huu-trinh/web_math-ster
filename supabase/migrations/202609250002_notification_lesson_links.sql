begin;
-- New broadcasts open the lesson player directly.
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
 'LESSON_MATERIAL',material.type::text,'/courses/' || material.course_id::text || '/lessons/' || material.lesson_id::text,submission_id)
 on conflict (request_id) where request_id is not null do nothing returning id into result;
 if result is null then select id into result from public.notifications where request_id=submission_id; end if;
 return result;
end $$;
revoke all on function public.publish_material_notification(uuid,uuid) from public,anon;
grant execute on function public.publish_material_notification(uuid,uuid) to authenticated;
commit;
