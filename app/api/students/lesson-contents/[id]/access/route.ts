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
         * 1. Lấy lesson_content
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
         * 2. Resource không liên kết exam
         *
         * → Cho phép xem bình thường.
         */
        if (!content.exam_id) {
            return NextResponse.json({
                allowed: true,
            });
        }

        /*
         * 3. Resource là đáp án
         *
         * Kiểm tra học sinh đã nộp
         * ít nhất một attempt hay chưa.
         */
        const {
            data: attempt,
            error: attemptError,
        } = await supabase
            .from("exam_attempts")
            .select("id")
            .eq(
                "student_id",
                student.id
            )
            .eq(
                "exam_id",
                content.exam_id
            )
            .not(
                "submitted_at",
                "is",
                null
            )
            .limit(1)
            .maybeSingle();

        if (attemptError) {
            throw attemptError;
        }

        /*
         * 4. Đã làm bài
         */
        if (attempt) {
            return NextResponse.json({
                allowed: true,
            });
        }

        /*
         * 5. Chưa làm bài
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