import { z } from "zod";

export const CreateVideoSchema =
  z.object({
    lesson_id: z.string().uuid(),

    title: z.string().min(1),

    description: z.string().optional(),

    provider: z.enum([
      "YOUTUBE",
      "GOOGLE_DRIVE",
      "VIMEO",
      "OTHER",
    ]),

    video_url: z.string().url(),

    thumbnail_url: z.string().url().optional(),

    duration_seconds: z.number().int().optional(),

    video_order: z.number().int(),

    is_preview: z.boolean().default(false),
  });

export const UpdateVideoSchema =
  CreateVideoSchema.partial();