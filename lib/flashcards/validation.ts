import { z } from "zod";

export const flashcardIdSchema = z.string().uuid("ID không hợp lệ.");
export const deckInputSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tên bộ thẻ.").max(200, "Tên bộ thẻ tối đa 200 ký tự."),
  description: z.string().trim().max(5000).nullable().optional(),
}).strict();
export const cardInputSchema = z.object({
  question: z.string().trim().min(1, "Vui lòng nhập câu hỏi.").max(10000),
  answer: z.string().trim().min(1, "Vui lòng nhập đáp án.").max(10000),
  note: z.string().trim().max(5000).nullable().optional(),
}).strict();
export const progressInputSchema = z.object({
  status: z.enum(["LEARNED", "REVIEW_NEEDED"]).optional(),
  isStarred: z.boolean().optional(),
}).strict().refine((value) => value.status !== undefined || value.isStarred !== undefined, "Chưa có thay đổi cần lưu.");
export const reorderInputSchema = z.array(flashcardIdSchema)
  .refine((ids) => new Set(ids).size === ids.length, "Danh sách thứ tự chứa thẻ trùng lặp.");
