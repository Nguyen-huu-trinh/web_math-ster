import { getDecks } from "@/app/actions/flashcards";
import { DeckCatalog } from "@/components/flashcards/deck-catalog";

export const metadata = { title: "Quản lý Flashcard | Math-Ster" };

export default async function TeacherFlashcardsPage() {
  return <DeckCatalog decks={await getDecks()} teacher />;
}
