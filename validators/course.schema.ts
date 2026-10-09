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
    .url().or(z.literal(""))
    .optional(),

  course_order: z.number().int().min(0).max(2147483647).default(0),

  is_active: z
    .boolean()
    .default(true),
});

export const UpdateCourseSchema =
  CreateCourseSchema.partial().extend({
    course_order: z.number().int().min(0).max(2147483647).optional(),
    is_active: z.boolean().optional(),
  });

export type CreateCourseInput =
  z.infer<typeof CreateCourseSchema>;

export type UpdateCourseInput =
  z.infer<typeof UpdateCourseSchema>;
