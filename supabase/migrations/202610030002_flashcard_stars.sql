begin;

-- Preserve existing stars and legacy history; the new UI only writes stars.
create function public.update_flashcard_stars(p_deck_id uuid, p_changes jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if coalesce(public.flashcard_role(), '') <> 'STUDENT' then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'array' then
    raise exception 'Invalid changes' using errcode = '22023';
  end if;
  if jsonb_array_length(p_changes) not between 1 and 200 or exists (
    select 1 from jsonb_array_elements(p_changes) x
    where jsonb_typeof(x) <> 'object' or jsonb_typeof(x->'cardId') is distinct from 'string'
      or jsonb_typeof(x->'isStarred') is distinct from 'boolean'
      or (x - 'cardId' - 'isStarred') <> '{}'::jsonb
  ) then raise exception 'Invalid changes' using errcode = '22023'; end if;
  if (select count(distinct (x->>'cardId')::uuid) from jsonb_array_elements(p_changes) x) <> jsonb_array_length(p_changes) then
    raise exception 'Duplicate cards' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_changes) x where not exists (
      select 1 from public.flashcards c where c.id = (x->>'cardId')::uuid and c.deck_id = p_deck_id
    )
  ) then raise exception 'Card not available' using errcode = 'P0002'; end if;

  insert into public.flashcard_student_progress(user_id, card_id, is_starred)
    select auth.uid(), (x->>'cardId')::uuid, (x->>'isStarred')::boolean
    from jsonb_array_elements(p_changes) x
  on conflict (user_id, card_id) do update set is_starred = excluded.is_starred
    where flashcard_student_progress.is_starred is distinct from excluded.is_starred;
end;
$$;
revoke all on function public.update_flashcard_stars(uuid,jsonb) from public, anon;
grant execute on function public.update_flashcard_stars(uuid,jsonb) to authenticated;

commit;
