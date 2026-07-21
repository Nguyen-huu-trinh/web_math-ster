import { z } from "zod";

export const UpdateLearningProgressSchema =
    z.object({

        student_id: z.string().uuid(),

        lesson_id: z.string().uuid(),

        progress_percent: z.number().min(0).max(100),

        watched_seconds: z.number().default(0),

        study_seconds: z.number().default(0),

        completed: z.boolean().default(false),

    });