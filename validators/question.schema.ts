import { z } from "zod";

export const CreateQuestionSchema = z.object({
  exam_id: z.string().uuid(),

  question_no: z.number().int(),

  question_type: z.enum([
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "SHORT_ANSWER",
  ]),

  content: z.string().min(1),

  explanation: z.string().optional(),

  score: z.number().positive(),
});

export const UpdateQuestionSchema =
  CreateQuestionSchema.partial();

export type CreateQuestionInput =
  z.infer<typeof CreateQuestionSchema>;