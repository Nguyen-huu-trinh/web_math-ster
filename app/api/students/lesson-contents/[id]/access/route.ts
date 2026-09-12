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
         * 1. Lấy lesson content
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
         * Header cache dùng chung cho trường hợp thành công (Cache ngắn 60s)
         */
        const cacheHeaders = {
            "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
        };

        /*
         * 2. Resource không liên kết exam → Cho phép xem
         */
        if (!content.exam_id) {
            return NextResponse.json(
                { allowed: true },
                { headers: cacheHeaders }
            );
        }

        /*
         * 3. Resource có liên kết exam → Kiểm tra attempt
         */
        const {
            data: attempt,
            error: attemptError,
        } = await supabase
            .from("exam_attempts")
            .select("id")
            .eq("student_id", student.id)
            .eq("exam_id", content.exam_id)
            .limit(1)
            .maybeSingle();

        if (attemptError) {
            throw attemptError;
        }

        /*
         * 4. Đã từng làm exam
         */
        if (attempt) {
            return NextResponse.json(
                { allowed: true },
                { headers: cacheHeaders }
            );
        }

        /*
         * 5. Chưa từng làm exam
         */
        return NextResponse.json(
            {
                allowed: false,
                message: "Cần làm đề kiểm tra trước khi xem đáp án.",
            },
            { headers: cacheHeaders }
        );

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
            { status: 500 }
        );
    }
}