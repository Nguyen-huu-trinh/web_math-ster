import { z } from "zod";

// ============================================================
// EXAM TYPE
// ============================================================

export const ExamTypeSchema = z.enum([
  "FREE",
  "MOET",
]);

// ============================================================
// EXAM CATEGORY
// ============================================================

export const ExamCategorySchema = z.enum([
  "ATTENDANCE",
  "PERIODIC",
]);

// ============================================================
// QUESTION CONFIG
// ============================================================

export const QuestionConfigSchema = z.object({
  multipleChoice: z
    .number()
    .int()
    .min(0),

  trueFalse: z
    .number()
    .int()
    .min(0),

  shortAnswer: z
    .number()
    .int()
    .min(0),
});

// ============================================================
// ANSWER KEY
// ============================================================

export const AnswerKeySchema = z.object({
  multipleChoice: z.array(
    z.string()
  ),

  trueFalse: z.array(
    z.array(z.string())
  ),

  shortAnswer: z.array(
    z.string()
  ),
});

// ============================================================
// CREATE EXAM
// ============================================================

export const CreateExamSchema = z.object({
  // ----------------------------------------------------------
  // Basic information
  // ----------------------------------------------------------

  title: z
    .string()
    .trim()
    .min(3, "Title is required")
    .max(200),

  description: z
    .string()
    .max(5000)
    .nullable()
    .optional(),

  // ----------------------------------------------------------
  // Course
  // ----------------------------------------------------------

  course_id: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  // ----------------------------------------------------------
  // Exam file
  // ----------------------------------------------------------

exam_file_url: z.string(),

  // ----------------------------------------------------------
  // Exam type / category
  // ----------------------------------------------------------

  exam_type: ExamTypeSchema,

  category: ExamCategorySchema,

  // ----------------------------------------------------------
  // Duration
  // ----------------------------------------------------------

  duration_minutes: z
    .number()
    .int()
    .min(1)
    .max(600),

  /**
   * Số ngày đề được phép làm kể từ ngày tạo đề.
   *
   * null / undefined = không giới hạn.
   *
   * Chỉ lưu số ngày ở bước này.
   * Chưa tính deadline.
   */
  exam_duration_days: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  // ----------------------------------------------------------
  // Scoring
  // ----------------------------------------------------------

  attendance_min_score: z
    .number()
    .min(0)
    .max(10)
    .nullable()
    .optional(),

  // ----------------------------------------------------------
  // Exam settings
  // ----------------------------------------------------------

  show_answer: z
    .boolean(),

  max_attempts: z
    .number()
    .int()
    .min(1)
    .max(100)
    .nullable()
    .optional(),

  start_at: z
    .string()
    .nullable()
    .optional(),

  end_at: z
    .string()
    .nullable()
    .optional(),

  // ----------------------------------------------------------
  // Questions
  // ----------------------------------------------------------

  question_config: QuestionConfigSchema,

  answer_key: AnswerKeySchema,

  // ----------------------------------------------------------
  // Teacher
  // ----------------------------------------------------------

  teacherId: z
    .string()
    .uuid()
    .optional(),
});

// ============================================================
// UPDATE EXAM
// ============================================================

export const UpdateExamSchema =
  CreateExamSchema.partial();

// ============================================================
// SEARCH
// ============================================================

export const SearchExamSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(1),
});

// ============================================================
// PAGINATION
// ============================================================

export const PaginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),
});

// ============================================================
// INFERRED TYPES
// ============================================================

export type CreateExamInput =
  z.infer<typeof CreateExamSchema>;

export type UpdateExamInput =
  z.infer<typeof UpdateExamSchema>;