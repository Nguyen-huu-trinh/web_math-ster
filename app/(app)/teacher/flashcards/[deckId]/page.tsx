import { notFound } from "next/navigation";
import { getDeckDetail } from "@/app/actions/flashcards";
import { DeckEditor } from "@/components/flashcards/deck-editor";
import { flashcardIdSchema } from "@/lib/flashcards/validation";

export const metadata = { title: "Biên tập Flashcard | Math-Ster" };

export default async function TeacherDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  if (!flashcardIdSchema.safeParse(deckId).success) notFound();
  const deck = await getDeckDetail(deckId);
  if (!deck) notFound();
  return <DeckEditor key={deck.id} deck={deck} />;
}
