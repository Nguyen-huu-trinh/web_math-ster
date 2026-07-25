import { LessonDocument } from "./document";

export interface LearningProgress {
  id: string;

  student_id: string;

  lesson_id: string;

  progress_percent: number;

  watched_seconds: number;

  study_seconds: number;

  completed: boolean;

  completed_at: string | null;

  last_studied_at: string | null;
}

export interface Lesson {
  id: string;

  chapter_id: string;

  title: string;

  description: string | null;

  lesson_order: number;

  estimated_minutes: number;

  youtube_id: string | null;

  assignment_id: string | null;

  is_published: boolean;

  deleted_at: string | null;

  created_at: string;

  updated_at: string;

  documents: LessonDocument[];

  progress?: LearningProgress | null;

  completed?: boolean;

  duration?: string;
}