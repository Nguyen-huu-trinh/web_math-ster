import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FlashcardDeck, FlashcardDeckDetail } from "@/types/flashcards";

export async function flashcardContext(area: "teacher" | "student") {
  const db = await createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) throw new Error("Vui lòng đăng nhập lại.");
  const { data: profile, error: profileError } = await db.from("profiles")
    .select("role, is_active").eq("id", user.id).single();
  if (profileError || !profile?.is_active || (area === "teacher"
    ? !["TEACHER", "ADMIN"].includes(profile.role)
    : profile.role !== "STUDENT")) {
    throw new Error("Bạn không có quyền truy cập chức năng này.");
  }
  return { db, user };
}

export function checkFlashcardError(error: { code?: string; message: string } | null) {
  if (!error) return;
  console.error("[Flashcards]", error.code, error.message);
  if (error.code === "22023" || error.code === "23505") {
    throw new Error("Danh sách thẻ đã thay đổi. Vui lòng tải lại trang và thử lại.");
  }
  if (error.code === "P0002" || error.code === "PGRST116") {
    throw new Error("Bộ thẻ hoặc thẻ không còn tồn tại hoặc chưa được xuất bản.");
  }
  throw new Error("Không thể xử lý dữ liệu Flashcard. Vui lòng thử lại.");
}

export async function readFlashcardDecks(area: "teacher" | "student"): Promise<FlashcardDeck[]> {
  const { db } = await flashcardContext(area);
  const { data, error } = await db.rpc("get_flashcard_decks");
  checkFlashcardError(error);
  const decks = (data ?? []) as FlashcardDeck[];
  return area === "student" ? decks.filter((deck) => deck.is_published) : decks;
}

export async function readFlashcardDeck(id: string, area: "teacher" | "student"): Promise<FlashcardDeckDetail | null> {
  const { db } = await flashcardContext(area);
  const { data, error } = await db.rpc("get_flashcard_deck_detail", { p_deck_id: id });
  checkFlashcardError(error);
  const deck = data as FlashcardDeckDetail | null;
  return deck && (area === "teacher" || deck.is_published) ? deck : null;
}
