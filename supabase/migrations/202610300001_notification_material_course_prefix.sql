begin;

create or replace function public.publish_material_notification(resource_id uuid, submission_id uuid, is_update boolean default false) returns uuid
language plpgsql security definer set search_path='' as $$
declare material record; result uuid; label text; material_subtype text;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role::text in ('TEACHER','ADMIN') and is_active is distinct from false) then
 raise exception 'Forbidden' using errcode='42501'; end if;
 if submission_id is null then raise exception 'Missing submission ID'; end if;
 select lc.title,lc.type,l.title as lesson_title,l.id as lesson_id,c.course_id,co.name as course_name into material
 from public.lesson_contents lc join public.lessons l on l.id=lc.lesson_id join public.chapters c on c.id=l.chapter_id join public.courses co on co.id=c.course_id where lc.id=resource_id;
 if not found then raise exception 'Resource not found' using errcode='P0002'; end if;
 material_subtype := case when material.type::text in ('VIDEO','PDF','EXAM') then material.type::text else 'DOCUMENT' end;
 label := case material_subtype when 'VIDEO' then 'video bài giảng' when 'PDF' then 'file PDF' when 'EXAM' then 'đề luyện tập' else 'tài liệu' end;
 insert into public.notifications(title,content,type,subtype,link,request_id)
 values (case when material_subtype in ('VIDEO','PDF') then
 concat_ws(' - ',nullif(trim(split_part(material.course_name,'-',1)),''),material.lesson_title)
 else material.lesson_title end,
 (case when is_update then 'Đã cập nhật ' else 'Đã thêm ' end) || label || case when nullif(trim(material.title),'') is not null then ' ' || trim(material.title) else '' end,
 'LESSON_MATERIAL',material_subtype,'/courses/' || material.course_id::text || '/lessons/' || material.lesson_id::text,submission_id)
 on conflict (request_id) where request_id is not null do nothing returning id into result;
 if result is null then select id into result from public.notifications where request_id=submission_id; end if;
 return result;
end $$;
revoke all on function public.publish_material_notification(uuid,uuid,boolean) from public,anon;
grant execute on function public.publish_material_notification(uuid,uuid,boolean) to authenticated;

-- Update existing PDF/video notifications without changing their content or read state.
update public.notifications n
set title=concat_ws(' - ',nullif(trim(split_part(co.name,'-',1)),''),l.title)
from public.lessons l
join public.chapters c on c.id=l.chapter_id
join public.courses co on co.id=c.course_id
where n.type='LESSON_MATERIAL' and n.subtype in ('VIDEO','PDF')
 and (n.link='/courses/' || c.course_id::text || '/lessons/' || l.id::text
 or (n.link like '/courses?%' and substring(n.link from '[?&]lessonId=([^&#]+)')=l.id::text));

commit;
