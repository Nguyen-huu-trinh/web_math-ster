import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";
import { createClient } from "@/lib/supabase/server";

interface Context {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    _request: Request,
    { params }: Context
) {
    try {
        const student = await requireStudent();

        const { id } = await params;

        const supabase = await createClient();

        /*
         * =====================================================
         * 1. Lấy lesson content
         * =====================================================
         */
        const {
            data: content,
            error: contentError,
        } = await supabase
            .from("lesson_contents")
            .select(`
                id,
                title,
                exam_id,
                file_link_id
            `)
            .eq("id", id)
            .single();

        if (contentError) {
            throw contentError;
        }

        /*
         * =====================================================
         * 2. Resource không liên kết exam
         *
         * → Cho phép xem bình thường.
         * =====================================================
         */
        if (!content.exam_id) {
            return NextResponse.json({
                allowed: true,
            });
        }

        /*
         * =====================================================
         * 2.5. Lấy thông tin Exam để biết Category
         * =====================================================
         */
        const { data: examData, error: examError } = await supabase
            .from("exams")
            .select("category")
            .eq("id", content.exam_id)
            .single();

        if (examError) {
            throw examError;
        }

        const isAttendanceExam = examData?.category === "ATTENDANCE";

        /*
         * =====================================================
         * 3. Resource có liên kết exam
         *
         * - Đề điểm danh (ATTENDANCE): Cần làm và ĐẠT (is_passed = true).
         * - Đề định kỳ (PERIODIC): Chỉ cần ĐÃ LÀM (có record attempt).
         * =====================================================
         */
        let attemptQuery = supabase
            .from("exam_attempts")
            .select("id")
            .eq("student_id", student.id)
            .eq("exam_id", content.exam_id);

        // Nếu là đề điểm danh -> Bắt buộc is_passed = true
        if (isAttendanceExam) {
            attemptQuery = attemptQuery.eq("is_passed", true);
        }

        const {
            data: attempt,
            error: attemptError,
        } = await attemptQuery
            .limit(1)
            .maybeSingle();

        if (attemptError) {
            throw attemptError;
        }

        /*
         * =====================================================
         * 4. Đã từng làm exam
         * =====================================================
         */
        if (attempt) {
            return NextResponse.json({
                allowed: true,
            });
        }

        /*
         * =====================================================
         * 5. Chưa từng làm exam / Chưa đạt
         * =====================================================
         */
        return NextResponse.json({
            allowed: false,
            message: isAttendanceExam
                ? "Cần làm đề kiểm tra đạt trước khi xem đáp án."
                : "Cần hoàn thành bài kiểm tra định kỳ trước khi xem đáp án.",
        });

    } catch (error) {
        console.error(
            "CHECK LESSON CONTENT ACCESS ERROR:",
            error
        );

        return NextResponse.json(
            {
                allowed: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể kiểm tra quyền truy cập.",
            },
            {
                status: 500,
            }
        );
    }
}