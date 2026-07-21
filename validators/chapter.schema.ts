import { z } from "zod";

export const CreateChapterSchema =
  z.object({
    course_id: z.string().uuid(),

    title: z.string().min(1),

    description: z.string().optional(),

    chapter_order: z.number().int(),
  });

export const UpdateChapterSchema =
  CreateChapterSchema.partial();