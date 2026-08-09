import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const student = await requireStudent();

        const body = await request.json();

        const code =
            typeof body.code === "string"
                ? body.code.trim()
                : "";

        if (!code) {
            return NextResponse.json(
                {
                    error:
                        "Vui lòng nhập mã điểm danh.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            await createClient();

        const { error } =
            await supabase
                .from("attendance")
                .upsert(
                    {
                        student_id:
                            student.id,
                        code,
                    },
                    {
                        onConflict:
                            "student_id",
                    }
                );

        if (error) {
            console.error(
                "ATTENDANCE INSERT ERROR:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Không thể lưu điểm danh.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Đã ghi nhận mã điểm danh.",
        });

    } catch (error) {
        console.error(
            "ATTENDANCE API ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            {
                status: 500,
            }
        );
    }
}