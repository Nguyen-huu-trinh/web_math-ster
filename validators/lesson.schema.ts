import { z } from "zod";

export const CreateLessonSchema =
  z.object({
    chapter_id: z.string().uuid(),

    title: z.string().min(1),

    description: z.string().optional(),

    lesson_order: z.number().int(),

    estimated_minutes: z.number().int().optional(),

    is_published: z.boolean().default(false),
  });

export const UpdateLessonSchema =
  CreateLessonSchema.partial();