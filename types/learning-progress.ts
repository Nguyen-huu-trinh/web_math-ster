export interface LearningProgress {
  id: string;

  student_id: string;

  lesson_id: string;

  progress_percent: number;

  watched_seconds: number;

  study_seconds: number;

  completed: boolean;

  last_studied_at: string | null;

  completed_at: string | null;

  created_at: string;

  updated_at: string;
}