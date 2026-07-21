import { z } from "zod";

export const CreateAnswerSchema = z.object({
  question_id: z.string().uuid(),

  answer_no: z.number().int().positive(),

  content: z.string().min(1),

  is_correct: z.boolean(),
});

export const UpdateAnswerSchema =
  CreateAnswerSchema.partial();

export type CreateAnswerInput =
  z.infer<typeof CreateAnswerSchema>;