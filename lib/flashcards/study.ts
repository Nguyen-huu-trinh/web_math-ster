import type { Flashcard } from "@/types/flashcards";

export type StudyFilter = "all" | "starred";

export function studyQueue(cards: Flashcard[], filter: StudyFilter): string[] {
  return cards.filter((card) => filter === "all" || card.progress?.is_starred).map((card) => card.id);
}

export function shuffleCards<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function sessionStats(queue: string[], ratings: Record<string, boolean>) {
  const done = queue.filter((id) => ratings[id]).length;
  return { done, percent: queue.length ? Math.round(done / queue.length * 100) : 0 };
}

export function nextUnrated(queue: string[], ratings: Record<string, boolean>, current: number) {
  for (let step = 1; step <= queue.length; step++) {
    const index = (current + step) % queue.length;
    if (!ratings[queue[index]]) return index;
  }
  return -1;
}
