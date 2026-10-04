export interface FlashcardProgress {
  is_starred: boolean;
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
  order_index: number;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  card_count: number;
  starred_count: number;
}

export interface FlashcardDeckDetail extends FlashcardDeck {
  cards: Flashcard[];
}

export interface DeckInput {
  title: string;
  description?: string | null;
  order_index?: number;
}

export interface FlashcardInput {
  question: string;
  answer: string;
  note?: string | null;
}

export interface StarInput {
  cardId: string;
  isStarred: boolean;
}

export type FlashcardActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
