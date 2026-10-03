import { notFound } from "next/navigation";
import { getStudentDeckStudy } from "@/app/actions/flashcards";
import { StudyRoom } from "@/components/flashcards/study-room";
import { flashcardIdSchema } from "@/lib/flashcards/validation";

export const metadata = { title: "Ôn tập Flashcard | Math-Ster" };

export default async function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  if (!flashcardIdSchema.safeParse(deckId).success) notFound();
  const deck = await getStudentDeckStudy(deckId);
  if (!deck) notFound();
  return <StudyRoom key={deck.id} deck={deck} />;
}
