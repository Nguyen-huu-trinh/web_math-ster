export type FlashcardStatus = "LEARNED" | "REVIEW_NEEDED";

export interface FlashcardProgress {
  id: string;
  user_id: string;
  card_id: string;
  is_starred: boolean;
  status: FlashcardStatus;
  reviewed_at: string | null;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  note: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  progress: FlashcardProgress | null;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  card_count: number;
  learned_count: number;
}

export interface FlashcardDeckDetail extends FlashcardDeck {
  cards: Flashcard[];
}

export interface DeckInput {
  title: string;
  description?: string | null;
}

export interface FlashcardInput {
  question: string;
  answer: string;
  note?: string | null;
}

export interface ProgressInput {
  status?: FlashcardStatus;
  isStarred?: boolean;
}

export type FlashcardActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
