import { z } from "zod";

export const CreateExerciseSchema =
  z.object({
    lesson_id: z.string().uuid(),

    exam_id: z.string().uuid(),

    title: z.string().min(1),

    description: z.string().optional(),

    exercise_order: z.number().int(),

    is_required: z.boolean().default(true),

    is_published: z.boolean().default(false),
  });

export const UpdateExerciseSchema =
  CreateExerciseSchema.partial();