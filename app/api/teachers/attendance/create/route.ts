import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

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

        console.log("[ATTENDANCE CREATE] BEFORE RPC", {
    code,
});

const {
    data,
    error,
} = await supabase.rpc(
    "create_attendance_session",
    {
        p_code: code,
    }
);

console.log("[ATTENDANCE CREATE] AFTER RPC", {
    data,
    error,
});

        if (error) {
            console.error(
                "CREATE ATTENDANCE ERROR:",
                error
            );

            return NextResponse.json(
                {
                    error: error.message,
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Đã tạo lượt điểm danh.",
            studentCount:
                Number(data ?? 0),
        });

    } catch (error) {
        console.error(
            "ATTENDANCE CREATE API ERROR:",
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