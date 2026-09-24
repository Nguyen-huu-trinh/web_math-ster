begin;
create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 content text not null,
 type text not null check (type in ('EXAM','LESSON_MATERIAL','GENERAL')),
 link text not null,
 created_at timestamptz not null default now()
);
-- Also tolerate installations which still have the old schema.
alter table public.notifications add column if not exists content text;
alter table public.notifications add column if not exists link text;
do $$ begin
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='message') then
  execute 'update public.notifications set content=coalesce(content,message), link=coalesce(link,''/dashboard'')';
  execute 'alter table public.notifications alter column message drop not null';
 end if;
end $$;
alter table public.notifications alter column content set not null;
alter table public.notifications alter column link set not null;
update public.notifications set type='GENERAL' where type not in ('EXAM','LESSON_MATERIAL','GENERAL');
alter table public.notifications drop constraint if exists notifications_broadcast_type;
alter table public.notifications add constraint notifications_broadcast_type check(type in ('EXAM','LESSON_MATERIAL','GENERAL'));
create index if not exists notifications_recent_idx on public.notifications(created_at desc, id desc);
create table if not exists public.notification_reads (
 user_id uuid not null references auth.users(id) on delete cascade,
 notification_id uuid not null references public.notifications(id) on delete cascade,
 read_at timestamptz not null default now(),
 primary key(user_id, notification_id)
);
create index if not exists notification_reads_notification_idx on public.notification_reads(notification_id);
alter table public.notifications enable row level security;
alter table public.notification_reads enable row level security;
-- Remove any permissive legacy policies on the two active tables.
do $$ declare p record; begin
 for p in select tablename, policyname from pg_policies where schemaname='public' and tablename in ('notifications','notification_reads') loop
 execute format('drop policy %I on public.%I',p.policyname,p.tablename);
 end loop;
end $$;
revoke all on public.notifications, public.notification_reads from public, anon, authenticated;
grant select on public.notifications to authenticated;
grant select, insert on public.notification_reads to authenticated;
create policy notifications_authenticated_read on public.notifications for select to authenticated using (true);
create policy notification_reads_own_select on public.notification_reads for select to authenticated using (user_id = (select auth.uid()));
create policy notification_reads_own_insert on public.notification_reads for insert to authenticated with check (user_id = (select auth.uid()));
-- Single bounded feed request, plus a total unread count over all broadcasts.
create or replace function public.get_notification_feed() returns jsonb
language sql stable security invoker set search_path = '' as $$
 select jsonb_build_object(
 'items', coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at desc,n.id desc) from (
 select n.id,n.title,n.content,n.type,n.link,n.created_at, exists(select 1 from public.notification_reads r where r.notification_id=n.id and r.user_id=(select auth.uid())) as is_read
 from public.notifications n order by n.created_at desc,n.id desc limit 20
 ) n),'[]'::jsonb),
 'unreadCount', (select count(*) from public.notifications n where not exists(select 1 from public.notification_reads r where r.notification_id=n.id and r.user_id=(select auth.uid())))
 );
$$;
revoke all on function public.get_notification_feed() from public, anon;
grant execute on function public.get_notification_feed() to authenticated;
-- Trigger-only function: clients cannot publish arbitrary notifications.
create or replace function public.broadcast_learning_notification() returns trigger
language plpgsql security definer set search_path = '' as $$
declare course_uuid uuid; chapter_uuid uuid;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role::text in ('TEACHER','ADMIN')) then return new; end if;
 if tg_table_name = 'exams' then
   insert into public.notifications(title,content,type,link)
   values ('Bài kiểm tra mới',new.title,'EXAM','/student-exams/open/' || new.id::text);
 else
   select c.course_id,c.id into course_uuid,chapter_uuid from public.lessons l join public.chapters c on c.id=l.chapter_id where l.id=new.lesson_id;
   if course_uuid is not null then
     insert into public.notifications(title,content,type,link)
     values (case when tg_op='INSERT' then 'Tài liệu bài học mới' else 'Tài liệu vừa cập nhật' end,new.title,'LESSON_MATERIAL','/courses?courseId=' || course_uuid::text || '&chapterId=' || chapter_uuid::text || '&lessonId=' || new.lesson_id::text);
   end if;
 end if;
 return new;
end $$;
revoke all on function public.broadcast_learning_notification() from public, anon, authenticated;
drop trigger if exists broadcast_exam_created on public.exams;
create trigger broadcast_exam_created after insert on public.exams for each row execute function public.broadcast_learning_notification();
drop trigger if exists broadcast_material_saved on public.lesson_contents;
create trigger broadcast_material_saved after insert or update on public.lesson_contents for each row execute function public.broadcast_learning_notification();
commit;
