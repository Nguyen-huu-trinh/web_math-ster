begin;

-- Existing decks keep their previous created_at ordering until edited.
alter table public.flashcard_decks
  add column order_index integer not null default 0
  constraint flashcard_decks_order_index_nonnegative check (order_index >= 0);

create index flashcard_decks_order_idx
  on public.flashcard_decks(order_index, created_at desc, id);

-- to_jsonb(d) also exposes order_index in get_flashcard_deck_detail.
create or replace function public.get_flashcard_decks() returns jsonb
language sql stable security invoker set search_path = '' as $$
select coalesce(jsonb_agg(to_jsonb(d) || jsonb_build_object(
  'card_count', (select count(*) from public.flashcards c where c.deck_id = d.id),
  'starred_count', (select count(*) from public.flashcards c join public.flashcard_student_progress p on p.card_id = c.id
    where c.deck_id = d.id and p.user_id = (select auth.uid()) and p.is_starred)
) order by d.order_index, d.created_at desc, d.id), '[]'::jsonb) from public.flashcard_decks d;
$$;

commit;
