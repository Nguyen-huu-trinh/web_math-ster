export interface LessonContent {
  id: string;

  lesson_id: string;

  type:
    | "VIDEO"
    | "PDF"
    | "SLIDE"
    | "LINK";

  title: string;

  url: string;

  order_index: number;

  created_at?: string;

  updated_at?: string;
}

export interface CreateLessonContentDto {
  lesson_id: string;

  type:
    | "VIDEO"
    | "PDF"
    | "SLIDE"
    | "LINK";

  title: string;

  url: string;

  order_index: number;
}

export interface UpdateLessonContentDto {
  title: string;

  type:
    | "VIDEO"
    | "PDF"
    | "SLIDE"
    | "LINK";

  url: string;

  order_index: number;
}