import { z } from "zod";

export const AddStudyTimeSchema =
  z.object({
    student_id: z.string().uuid(),

    lesson_id: z.string().uuid().optional(),

    course_id: z.string().uuid().optional(),

    seconds: z.number().positive(),
  });