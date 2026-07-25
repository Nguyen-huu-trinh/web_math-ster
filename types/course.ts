export interface Course {
  id: string;

  name: string;

  description: string | null;

  thumbnail_url: string | null;

  is_active: boolean;

  deleted_at: string | null;

  created_at: string;

  updated_at: string;

  totalLessons?: number;

  progress?: number;

  teacher?: string;

  chapters?: Chapter[];
}

export interface Chapter {
  id: string;

  title: string;

  chapter_order: number;

  deleted_at: string | null;

  lessons: Lesson[];
}

export interface Lesson {
  id: string;

  title: string;

  description: string | null;

  lesson_order: number;

  estimated_minutes: number;

  video_url: string | null;

  assignment_id: string | null;

  completed?: boolean;

  progress?: LearningProgress | null;

  documents: LessonDocument[];
}

export interface LessonDocument {
  id: string;

  title: string;

  file_url: string;

  file_type: string;

  document_order: number;
}

export interface LearningProgress {
  completed: boolean;

  progress_percent: number;

  watched_seconds: number;

  study_seconds: number;
}