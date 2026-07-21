import { z } from "zod";

export const ExamTypeSchema = z.enum([
  "FREE",
  "MOET",
]);

export const ExamCategorySchema = z.enum([
  "ATTENDANCE",
  "PERIODIC",
]);

export const CreateExamSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title is required")
    .max(200),

  description: z
    .string()
    .max(5000)
    .optional(),

  exam_type: ExamTypeSchema,

  exam_category: ExamCategorySchema,

  duration_minutes: z
    .number()
    .int()
    .min(1)
    .max(600),

  total_score: z
    .number()
    .positive(),

  max_attempts: z
    .number()
    .int()
    .min(1)
    .max(100),
});

export const UpdateExamSchema =
  CreateExamSchema.partial();

export const SearchExamSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(1),
});

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

export type CreateExamInput =
  z.infer<typeof CreateExamSchema>;

export type UpdateExamInput =
  z.infer<typeof UpdateExamSchema>;