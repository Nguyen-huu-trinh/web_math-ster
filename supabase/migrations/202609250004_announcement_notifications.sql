begin;

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications drop constraint if exists notifications_broadcast_type;
alter table public.notifications add constraint notifications_broadcast_type
 check (type in ('EXAM', 'LESSON_MATERIAL', 'GENERAL', 'ANNOUNCEMENT'));

-- Both writes commit together. A failed broadcast must not report a saved announcement.
create or replace function public.save_announcement(
 announcement_id uuid, title_value text, content_value text
) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if not exists (
  select 1 from public.profiles where id = auth.uid()
  and role::text in ('TEACHER', 'ADMIN') and is_active is distinct from false
 ) then
  raise exception 'Forbidden' using errcode = '42501';
 end if;
 if nullif(trim(title_value), '') is null then
  raise exception 'Missing announcement title' using errcode = '22023';
 end if;

 update public.announcements
 set title = title_value, content = coalesce(content_value, ''), updated_at = now()
 where id = announcement_id;
 if not found then
  raise exception 'Announcement not found' using errcode = 'P0002';
 end if;

 insert into public.notifications(title, content, type, subtype, link)
 values (title_value, case when nullif(trim(content_value), '') is null then null else content_value end,
  'ANNOUNCEMENT', 'GENERAL', '/dashboard');
end $$;

revoke all on function public.save_announcement(uuid, text, text) from public, anon;
grant execute on function public.save_announcement(uuid, text, text) to authenticated;

commit;
