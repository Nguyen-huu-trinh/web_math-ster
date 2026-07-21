import { z } from "zod";

export const CreateCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(200),

  description: z
    .string()
    .max(5000)
    .optional(),

  thumbnail_url: z
    .string()
    .url()
    .optional(),

  is_active: z
    .boolean()
    .default(true),
});

export const UpdateCourseSchema =
  CreateCourseSchema.partial();

export type CreateCourseInput =
  z.infer<typeof CreateCourseSchema>;

export type UpdateCourseInput =
  z.infer<typeof UpdateCourseSchema>;