import { z } from "zod";

export const CreateCourseEnrollmentSchema =
  z.object({
    course_id: z.string().uuid(),

    student_id: z.string().uuid(),

    status: z
      .enum([
        "ACTIVE",
        "COMPLETED",
        "DROPPED",
        "BLOCKED",
      ])
      .default("ACTIVE"),
  });

export const UpdateEnrollmentStatusSchema =
  z.object({
    status: z.enum([
      "ACTIVE",
      "COMPLETED",
      "DROPPED",
      "BLOCKED",
    ]),
  });