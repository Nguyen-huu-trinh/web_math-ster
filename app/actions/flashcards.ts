"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cardInputSchema, deckInputSchema, flashcardIdSchema, progressInputSchema, reorderInputSchema } from "@/lib/flashcards/validation";
import { checkFlashcardError, flashcardContext, readFlashcardDeck, readFlashcardDecks } from "@/services/flashcard.service";
import type { DeckInput, FlashcardActionResult, FlashcardInput, FlashcardProgress, ProgressInput } from "@/types/flashcards";

function refresh(deckId?: string) {
  revalidatePath("/flashcards");
  revalidatePath("/teacher/flashcards");
  if (deckId) {
    revalidatePath(`/flashcards/${deckId}`);
    revalidatePath(`/teacher/flashcards/${deckId}`);
  }
}

async function action<T>(work: () => Promise<T>): Promise<FlashcardActionResult<T>> {
  try { return { ok: true, data: await work() }; }
  catch (error) {
    return { ok: false, error: error instanceof z.ZodError
      ? error.issues[0]?.message ?? "Dữ liệu không hợp lệ."
      : error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại." };
  }
}

export async function getDecks() { return readFlashcardDecks("teacher"); }
export async function getPublishedDecks() { return readFlashcardDecks("student"); }
export async function getDeckDetail(deckId: string) {
  return readFlashcardDeck(flashcardIdSchema.parse(deckId), "teacher");
}
export async function getStudentDeckStudy(deckId: string) {
  return readFlashcardDeck(flashcardIdSchema.parse(deckId), "student");
}

export async function createDeck(input: DeckInput) {
  return action(async () => {
    const { db } = await flashcardContext("teacher");
    const payload = deckInputSchema.parse(input);
    const { data, error } = await db.from("flashcard_decks").insert(payload).select("id").single();
    checkFlashcardError(error);
    refresh();
    return data!.id as string;
  });
}

export async function updateDeck(id: string, input: DeckInput) {
  return action(async () => {
    const { db } = await flashcardContext("teacher");
    const deckId = flashcardIdSchema.parse(id);
    const { error } = await db.from("flashcard_decks").update(deckInputSchema.parse(input))
      .eq("id", deckId).select("id").single();
    checkFlashcardError(error);
    refresh(deckId);
  });
}

export async function deleteDeck(id: string) {
  return action(async () => {
    const { db } = await flashcardContext("teacher");
    const deckId = flashcardIdSchema.parse(id);
    const { error } = await db.from("flashcard_decks").delete().eq("id", deckId).select("id").single();
    checkFlashcardError(error);
    refresh(deckId);
  });
}

export async function togglePublishDeck(id: string, isPublished: boolean) {
  return action(async () => {
    const { db } = await flashcardContext("teacher");
    const deckId = flashcardIdSchema.parse(id);
    const { error } = await db.from("flashcard_decks").update({ is_published: z.boolean().parse(isPublished) })
      .eq("id", deckId).select("id").single();
    checkFlashcardError(error);
    refresh(deckId);
  });
}

export async function createFlashcard(id: string, input: FlashcardInput) {
  return action(async () => {
    const { db } = await flashcardContext("teacher");
    const deckId = flashcardIdSchema.parse(id);
    const card = cardInputSchema.parse(input);
    const { data, error } = await db.rpc("create_flashcard", {
      p_deck_id: deckId, p_question: card.question, p_answer: card.answer, p_note: card.note ?? null,
    });
    checkFlashcardError(error);
    refresh(deckId);
    return (data as { id: string }).id;
  });
}

export async function updateFlashcard(id: string, input: FlashcardInput) {
  return action(async () => {
    const { db } = await flashcardContext("teacher");
    const { data, error } = await db.from("flashcards").update(cardInputSchema.parse(input))
      .eq("id", flashcardIdSchema.parse(id)).select("deck_id").single();
    checkFlashcardError(error);
    refresh(data!.deck_id);
  });
}

export async function deleteFlashcard(id: string) {
  return action(async () => {
    const { db } = await flashcardContext("teacher");
    const { data, error } = await db.from("flashcards").delete()
      .eq("id", flashcardIdSchema.parse(id)).select("deck_id").single();
    checkFlashcardError(error);
    refresh(data!.deck_id);
  });
}

export async function reorderFlashcards(id: string, order: string[]) {
  return action(async () => {
    const { db } = await flashcardContext("teacher");
    const deckId = flashcardIdSchema.parse(id);
    const { error } = await db.rpc("reorder_flashcards", { p_deck_id: deckId, p_card_ids: reorderInputSchema.parse(order) });
    checkFlashcardError(error);
    refresh(deckId);
  });
}

export async function updateCardProgress(id: string, input: ProgressInput) {
  return action<FlashcardProgress>(async () => {
    const { db } = await flashcardContext("student");
    const progress = progressInputSchema.parse(input);
    const { data, error } = await db.rpc("update_flashcard_progress", {
      p_card_id: flashcardIdSchema.parse(id), p_status: progress.status ?? null, p_is_starred: progress.isStarred ?? null,
    });
    checkFlashcardError(error);
    revalidatePath("/flashcards");
    return data as FlashcardProgress;
  });
}
