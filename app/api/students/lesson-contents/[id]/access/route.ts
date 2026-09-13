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
    const cacheHeaders = {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
    };

    try {
        // 1. Kiểm tra auth an toàn
        let student;
        try {
            student = await requireStudent();
        } catch {
            return NextResponse.json(
                { allowed: false, message: "Yêu cầu đăng nhập học sinh." },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const id = resolvedParams?.id;

        if (!id) {
            return NextResponse.json(
                { allowed: false, message: "Thiếu ID nội dung bài học." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // 2. Query gộp: Lấy lesson_content và check attempt của student cùng lúc
        const { data: content, error: contentError } = await supabase
            .from("lesson_contents")
            .select(`
                id,
                exam_id,
                exam_attempts!left (
                    id
                )
            `)
            .eq("id", id)
            .eq("exam_attempts.student_id", student.id)
            .maybeSingle();

        if (contentError) {
            console.error("[SUPABASE QUERY ERROR]", contentError);
            throw contentError;
        }

        if (!content) {
            return NextResponse.json(
                { allowed: false, message: "Không tìm thấy tài liệu." },
                { status: 404 }
            );
        }

        // 3. Nếu tài liệu không gắn với bài thi -> Cho phép truy cập
        if (!content.exam_id) {
            return NextResponse.json(
                { allowed: true },
                { headers: cacheHeaders }
            );
        }

        // 4. Nếu tài liệu có bài thi -> Kiểm tra xem student đã làm bài thi chưa
        const hasAttempted = Array.isArray(content.exam_attempts) 
            ? content.exam_attempts.length > 0 
            : Boolean(content.exam_attempts);

        if (hasAttempted) {
            return NextResponse.json(
                { allowed: true },
                { headers: cacheHeaders }
            );
        }

        // 5. Chưa làm bài thi
        return NextResponse.json(
            {
                allowed: false,
                message: "Cần làm đề kiểm tra trước khi xem đáp án.",
            },
            { headers: cacheHeaders }
        );

    } catch (error) {
        console.error("CHECK LESSON CONTENT ACCESS ERROR:", error);

        return NextResponse.json(
            {
                allowed: false,
                message: "Không thể kiểm tra quyền truy cập.",
            },
            { status: 500 }
        );
    }
}