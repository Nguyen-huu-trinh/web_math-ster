import { getPublishedDecks } from "@/app/actions/flashcards";
import { DeckCatalog } from "@/components/flashcards/deck-catalog";

export const metadata = { title: "Flashcard Toán học | Math-Ster" };

export default async function FlashcardsPage() {
  return <DeckCatalog decks={await getPublishedDecks()} />;
}
