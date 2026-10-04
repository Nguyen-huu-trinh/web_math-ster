import { z } from "zod";

export const flashcardIdSchema = z.string().uuid("ID không hợp lệ.");
export const deckInputSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tên bộ thẻ.").max(200, "Tên bộ thẻ tối đa 200 ký tự."),
  description: z.string().trim().max(5000).nullable().optional(),
  order_index: z.number("Thứ tự hiển thị phải là số nguyên không âm.")
    .int("Thứ tự hiển thị phải là số nguyên.")
    .min(0, "Thứ tự hiển thị không được âm.")
    .max(2147483647, "Thứ tự hiển thị tối đa 2147483647.").optional(),
}).strict();
export const cardInputSchema = z.object({
  question: z.string().trim().min(1, "Vui lòng nhập câu hỏi.").max(10000),
  answer: z.string().trim().min(1, "Vui lòng nhập đáp án.").max(10000),
  note: z.string().trim().max(5000).nullable().optional(),
}).strict();
export const starBatchSchema = z.array(z.object({
  cardId: flashcardIdSchema,
  isStarred: z.boolean(),
}).strict()).min(1).max(200).refine((items) => new Set(items.map((item) => item.cardId)).size === items.length, "Danh sách chứa thẻ trùng lặp.");
export const reorderInputSchema = z.array(flashcardIdSchema)
  .refine((ids) => new Set(ids).size === ids.length, "Danh sách thứ tự chứa thẻ trùng lặp.");
