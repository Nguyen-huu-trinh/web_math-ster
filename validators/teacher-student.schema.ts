import { z } from "zod";

export const JoinedDateSchema = z.string().date("Ngày vào lớp không hợp lệ.");

export const UpdateTeacherStudentSchema = z.object({
    joinedDate: JoinedDateSchema.optional(),
    personalEmail: z.union([
        z.string().trim().email("Email cá nhân không hợp lệ."),
        z.string().trim().length(0).transform(() => null),
    ]).nullable().optional(),
    points: z.number().optional(),
    rewardMoney: z.number().nonnegative("Tiền thưởng không được âm.").optional(),
}).strict().refine((values) => Object.values(values).some((value) => value !== undefined), {
    message: "Không có dữ liệu cần cập nhật.",
});

export type UpdateTeacherStudentInput = z.infer<typeof UpdateTeacherStudentSchema>;
