begin;

create type public.flashcard_status as enum ('LEARNED', 'REVIEW_NEEDED');

create table public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null check (length(trim(title)) > 0),
  description text check (length(description) <= 5000),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  question text not null check (length(trim(question)) between 1 and 10000),
  answer text not null check (length(trim(answer)) between 1 and 10000),
  note text check (length(note) <= 5000),
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flashcards_deck_order unique (deck_id, order_index) deferrable initially deferred
);
create table public.flashcard_student_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid not null references public.flashcards(id) on delete cascade,
  is_starred boolean not null default false,
  status public.flashcard_status not null default 'REVIEW_NEEDED',
  reviewed_at timestamptz,
  unique (user_id, card_id)
);
create index flashcard_progress_card_idx on public.flashcard_student_progress(card_id);
create index flashcard_decks_published_idx on public.flashcard_decks(is_published, created_at desc);

create function public.flashcard_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger flashcard_decks_updated before update on public.flashcard_decks
for each row execute function public.flashcard_touch_updated_at();
create trigger flashcards_updated before update on public.flashcards
for each row execute function public.flashcard_touch_updated_at();

-- Role lookup is limited to the caller and does not depend on profiles' RLS policies.
create function public.flashcard_role() returns text
language sql stable security definer set search_path = '' as $$
  select p.role::text from public.profiles p
  where p.id = (select auth.uid()) and p.is_active = true;
$$;
revoke all on function public.flashcard_role() from public, anon;
grant execute on function public.flashcard_role() to authenticated;

alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_student_progress enable row level security;
revoke all on public.flashcard_decks, public.flashcards, public.flashcard_student_progress from public, anon, authenticated;
grant select, insert, update, delete on public.flashcard_decks, public.flashcards to authenticated;
grant select, insert, update on public.flashcard_student_progress to authenticated;

create policy decks_teacher_all on public.flashcard_decks for all to authenticated
using ((select public.flashcard_role()) in ('TEACHER', 'ADMIN'))
with check ((select public.flashcard_role()) in ('TEACHER', 'ADMIN'));
create policy decks_student_read on public.flashcard_decks for select to authenticated
using (is_published and (select public.flashcard_role()) = 'STUDENT');
create policy cards_teacher_all on public.flashcards for all to authenticated
using ((select public.flashcard_role()) in ('TEACHER', 'ADMIN'))
with check ((select public.flashcard_role()) in ('TEACHER', 'ADMIN'));
create policy cards_student_read on public.flashcards for select to authenticated
using ((select public.flashcard_role()) = 'STUDENT' and exists (
  select 1 from public.flashcard_decks d where d.id = deck_id and d.is_published
));
create policy progress_own_read on public.flashcard_student_progress for select to authenticated
using (user_id = (select auth.uid()) and (select public.flashcard_role()) = 'STUDENT'
  and exists (select 1 from public.flashcards c where c.id = card_id));
create policy progress_own_insert on public.flashcard_student_progress for insert to authenticated
with check (user_id = (select auth.uid()) and (select public.flashcard_role()) = 'STUDENT'
  and exists (select 1 from public.flashcards c where c.id = card_id));
create policy progress_own_update on public.flashcard_student_progress for update to authenticated
using (user_id = (select auth.uid()) and (select public.flashcard_role()) = 'STUDENT'
  and exists (select 1 from public.flashcards c where c.id = card_id))
with check (user_id = (select auth.uid()) and (select public.flashcard_role()) = 'STUDENT'
  and exists (select 1 from public.flashcards c where c.id = card_id));

-- Aggregate in SQL so PostgREST's row limit cannot silently truncate a deck or its counts.
create function public.get_flashcard_decks() returns jsonb
language sql stable security invoker set search_path = '' as $$
select coalesce(jsonb_agg(to_jsonb(d) || jsonb_build_object(
  'card_count', (select count(*) from public.flashcards c where c.deck_id = d.id),
  'learned_count', (select count(*) from public.flashcards c join public.flashcard_student_progress p on p.card_id = c.id
    where c.deck_id = d.id and p.user_id = (select auth.uid()) and p.status = 'LEARNED')
) order by d.created_at desc, d.id), '[]'::jsonb) from public.flashcard_decks d;
$$;
create function public.get_flashcard_deck_detail(p_deck_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
select to_jsonb(d) || jsonb_build_object(
  'card_count', (select count(*) from public.flashcards c where c.deck_id = d.id),
  'learned_count', (select count(*) from public.flashcards c join public.flashcard_student_progress p on p.card_id = c.id
    where c.deck_id = d.id and p.user_id = (select auth.uid()) and p.status = 'LEARNED'),
  'cards', coalesce((select jsonb_agg(to_jsonb(c) || jsonb_build_object('progress',
    (select to_jsonb(p) from public.flashcard_student_progress p where p.card_id = c.id and p.user_id = (select auth.uid()))
  ) order by c.order_index, c.id) from public.flashcards c where c.deck_id = d.id), '[]'::jsonb)
) from public.flashcard_decks d where d.id = p_deck_id;
$$;

-- Serialize appends/reorders on a deck. Reorders must contain exactly its current card IDs.
create function public.create_flashcard(p_deck_id uuid, p_question text, p_answer text, p_note text default null)
returns public.flashcards language plpgsql security invoker set search_path = '' as $$
declare result public.flashcards;
begin
  if coalesce(public.flashcard_role(), '') not in ('TEACHER','ADMIN') then raise exception 'Forbidden' using errcode = '42501'; end if;
  perform 1 from public.flashcard_decks where id = p_deck_id for update;
  if not found then raise exception 'Deck not found' using errcode = 'P0002'; end if;
  insert into public.flashcards(deck_id, question, answer, note, order_index)
  values (p_deck_id, p_question, p_answer, p_note, (select coalesce(max(order_index), -1) + 1 from public.flashcards where deck_id = p_deck_id))
  returning * into result;
  return result;
end;
$$;
create function public.reorder_flashcards(p_deck_id uuid, p_card_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if coalesce(public.flashcard_role(), '') not in ('TEACHER','ADMIN') then raise exception 'Forbidden' using errcode = '42501'; end if;
  perform 1 from public.flashcard_decks where id = p_deck_id for update;
  if not found then raise exception 'Deck not found' using errcode = 'P0002'; end if;
  if p_card_ids is null
    or cardinality(p_card_ids) <> (select count(distinct id) from unnest(p_card_ids) as ids(id))
    or cardinality(p_card_ids) <> (select count(*) from public.flashcards where deck_id = p_deck_id)
    or exists (select 1 from unnest(p_card_ids) as ids(id) where not exists (
      select 1 from public.flashcards c where c.id = ids.id and c.deck_id = p_deck_id
    )) then raise exception 'Card list changed; reload the deck' using errcode = '22023'; end if;
  update public.flashcards c set order_index = (ids.position - 1)::integer
  from unnest(p_card_ids) with ordinality as ids(id, position)
  where c.id = ids.id and c.deck_id = p_deck_id;
end;
$$;

-- Partial updates are atomic: starring never resets a learned status or its review timestamp.
create function public.update_flashcard_progress(p_card_id uuid, p_status public.flashcard_status default null, p_is_starred boolean default null)
returns public.flashcard_student_progress language plpgsql security invoker set search_path = '' as $$
declare result public.flashcard_student_progress;
begin
  if coalesce(public.flashcard_role(), '') <> 'STUDENT' then raise exception 'Forbidden' using errcode = '42501'; end if;
  if p_status is null and p_is_starred is null then raise exception 'Empty update' using errcode = '22023'; end if;
  if not exists (select 1 from public.flashcards where id = p_card_id) then raise exception 'Card not available' using errcode = 'P0002'; end if;
  insert into public.flashcard_student_progress(user_id, card_id, status, is_starred, reviewed_at)
  values (auth.uid(), p_card_id, coalesce(p_status, 'REVIEW_NEEDED'), coalesce(p_is_starred, false), case when p_status is not null then now() end)
  on conflict (user_id, card_id) do update set
    status = coalesce(p_status, flashcard_student_progress.status),
    is_starred = coalesce(p_is_starred, flashcard_student_progress.is_starred),
    reviewed_at = case when p_status is not null then now() else flashcard_student_progress.reviewed_at end
  returning * into result;
  return result;
end;
$$;

revoke all on function public.flashcard_touch_updated_at() from public, anon, authenticated;
revoke all on function public.get_flashcard_decks(), public.get_flashcard_deck_detail(uuid),
 public.create_flashcard(uuid,text,text,text), public.reorder_flashcards(uuid,uuid[]),
 public.update_flashcard_progress(uuid,public.flashcard_status,boolean) from public, anon;
grant execute on function public.get_flashcard_decks(), public.get_flashcard_deck_detail(uuid),
 public.create_flashcard(uuid,text,text,text), public.reorder_flashcards(uuid,uuid[]),
 public.update_flashcard_progress(uuid,public.flashcard_status,boolean) to authenticated;

commit;
