import { z } from "zod";

export const UpdateLearningProgressSchema = z.object({
    student_id: z.string().uuid(),
    lesson_id: z.string().uuid(),
    is_completed: z.boolean(),
});