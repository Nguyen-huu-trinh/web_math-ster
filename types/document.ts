export interface LessonDocument {
  id: string;

  lesson_id: string;

  title: string;

  description: string | null;

  file_url: string;

  file_name: string;

  file_size: number | null;

  file_type: string;

  document_order: number;

  deleted_at: string | null;

  created_at: string;

  updated_at: string;
}