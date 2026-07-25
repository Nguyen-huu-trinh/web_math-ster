export type ExamType =
  | "MOET"
  | "FREE";

export type ExamCategory =
  | "ATTENDANCE"
  | "PERIODIC";

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";
export type ExamStatus =
  | "OPEN"
  | "LOCKED";
export interface QuestionConfig {
  multipleChoice: number;
  trueFalse: number;
  shortAnswer: number;
}

export interface AnswerKey {
  multipleChoice: string[];
  trueFalse: string[][];
  shortAnswer: string[];
}

export interface Exam {
  id: string;

  title: string;

  description: string | null;

  course_id: string | null;

  exam_file_url: string;

  exam_type: ExamType;

  category: ExamCategory;

  duration_minutes: number;

  attendance_min_score: number | null;

  show_answer: boolean;

  max_attempts: number | null;

  start_at: string | null;

  end_at: string |null;

  status: string;

  is_active: boolean;

  question_config: QuestionConfig;

  answer_key: AnswerKey;

  created_by: string | null;

  created_at: string;

  updated_at: string;
}

export interface CreateExamDto {
  title: string;

  description?: string | null;

  course_id?: string | null;

  exam_file_url: string;

  exam_type: ExamType;

  category: ExamCategory;

  duration_minutes: number;

  attendance_min_score?: number | null;

  show_answer: boolean;

  max_attempts?: number | null;

  start_at?: string | null;

  end_at?: string | null;

  question_config: QuestionConfig;
  answer_key: AnswerKey;

  // PHẢI CÓ
  teacherId: string;
}

export interface UpdateExamDto {
  title?: string;

  description?: string | null;

  course_id?: string | null;

  exam_file_url?: string;

  exam_type?: ExamType;

  category?: ExamCategory;

  duration_minutes?: number;

  attendance_min_score?: number | null;

  show_answer?: boolean;

  max_attempts?: number | null;

  start_at?: string | null;

  end_at?: string | null;

  status?: string;

  is_active?: boolean;

  question_config?: QuestionConfig;

  answer_key?: AnswerKey;
}