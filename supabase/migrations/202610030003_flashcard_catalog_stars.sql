begin;

-- Derive catalog progress from each student's stars, never legacy ratings.
create or replace function public.get_flashcard_decks() returns jsonb
language sql stable security invoker set search_path = '' as $$
select coalesce(jsonb_agg(to_jsonb(d) || jsonb_build_object(
  'card_count', (select count(*) from public.flashcards c where c.deck_id = d.id),
  'starred_count', (select count(*) from public.flashcards c join public.flashcard_student_progress p on p.card_id = c.id
    where c.deck_id = d.id and p.user_id = (select auth.uid()) and p.is_starred)
) order by d.created_at desc, d.id), '[]'::jsonb) from public.flashcard_decks d;
$$;

create or replace function public.get_flashcard_deck_detail(p_deck_id uuid) returns jsonb
language sql stable security invoker set search_path = '' as $$
select to_jsonb(d) || jsonb_build_object(
  'card_count', (select count(*) from public.flashcards c where c.deck_id = d.id),
  'starred_count', (select count(*) from public.flashcards c join public.flashcard_student_progress p on p.card_id = c.id
    where c.deck_id = d.id and p.user_id = (select auth.uid()) and p.is_starred),
  'cards', coalesce((select jsonb_agg(to_jsonb(c) || jsonb_build_object('progress',
    (select jsonb_build_object('is_starred', p.is_starred) from public.flashcard_student_progress p where p.card_id = c.id and p.user_id = (select auth.uid()))
  ) order by c.order_index, c.id) from public.flashcards c where c.deck_id = d.id), '[]'::jsonb)
) from public.flashcard_decks d where d.id = p_deck_id;
$$;

commit;
