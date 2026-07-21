import { z } from "zod";

export const UpdateVideoWatchSchema =
  z.object({
    student_id: z.string().uuid(),

    video_id: z.string().uuid(),

    current_second: z.number(),

    watched_seconds: z.number(),

    completed: z.boolean().default(false),
  });