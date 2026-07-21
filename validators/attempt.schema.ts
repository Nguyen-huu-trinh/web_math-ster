import { z } from "zod";

export const StartAttemptSchema = z.object({
  exam_id: z.string().uuid(),
});

export const SubmitAttemptSchema = z.object({
  attempt_id: z.string().uuid(),
});

export const UpdateScoreSchema = z.object({
  score: z.number().min(0),
});

export const UpdateDurationSchema = z.object({
  duration_seconds: z.number().int().min(0),
});