import { z } from "zod";

export const CreateStudentSchema = z.object({
  student_code: z
    .string()
    .min(4)
    .max(20),

  full_name: z
    .string()
    .min(2),

  email: z
    .string()
    .email(),

  avatar_url: z
    .string()
    .optional(),
});

export const UpdateStudentSchema = z.object({
  full_name: z
    .string()
    .min(2)
    .optional(),

  avatar_url: z
    .string()
    .optional(),

  is_active: z
    .boolean()
    .optional(),
});