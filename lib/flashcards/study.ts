import type { Flashcard, FlashcardStatus } from "@/types/flashcards";

export type StudyFilter = "all" | "starred" | "review";

export function studyQueue(cards: Flashcard[], filter: StudyFilter): string[] {
  return cards.filter((card) => filter === "all" || (filter === "starred"
    ? card.progress?.is_starred
    : card.progress?.status !== "LEARNED")).map((card) => card.id);
}

export function shuffleCards<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function sessionStats(queue: string[], ratings: Record<string, FlashcardStatus>) {
  const learned = queue.filter((id) => ratings[id] === "LEARNED").length;
  const review = queue.filter((id) => ratings[id] === "REVIEW_NEEDED").length;
  return { learned, review, done: learned + review, percent: queue.length ? Math.round((learned + review) / queue.length * 100) : 0 };
}

export function nextUnrated(queue: string[], ratings: Record<string, FlashcardStatus>, current: number) {
  for (let step = 1; step <= queue.length; step++) {
    const index = (current + step) % queue.length;
    if (!ratings[queue[index]]) return index;
  }
  return -1;
}
