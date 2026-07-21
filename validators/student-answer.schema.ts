import { z } from "zod";

export const SaveStudentAnswerSchema =
  z.object({
    attempt_id: z.string().uuid(),

    question_id: z.string().uuid(),

    answer_id: z.string().uuid().nullable().optional(),

    answer_text: z.string().nullable().optional(),
  });

export type SaveStudentAnswerInput =
  z.infer<
    typeof SaveStudentAnswerSchema
  >;