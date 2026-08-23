import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";
import { createClient } from "@/lib/supabase/server";

interface Context {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    request: Request,
    { params }: Context
) {
    try {
        const student =
            await requireStudent();

        const { id } = await params;

        const supabase =
            await createClient();

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
         * 3. Resource có liên kết exam
         *
         * Kiểm tra học sinh đã có ít nhất
         * một attempt của đúng exam hay chưa.
         *
         * KHÔNG yêu cầu submitted_at.
         * =====================================================
         */
        const {
            data: attempt,
            error: attemptError,
        } = await supabase
            .from("exam_attempts")
            .select(`
                id,
                exam_id,
                student_id,
                attempt_number,
                submitted_at
            `)
            .eq(
                "student_id",
                student.id
            )
            .eq(
                "exam_id",
                content.exam_id
            )
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
         * 5. Chưa từng làm exam
         * =====================================================
         */
        return NextResponse.json({
            allowed: false,
            message:
                "Cần làm đề kiểm tra trước khi xem đáp án.",
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