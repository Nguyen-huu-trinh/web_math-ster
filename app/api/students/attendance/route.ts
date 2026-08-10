import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const student =
            await requireStudent();

        const body =
            await request.json();

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

        const {
            data,
            error,
        } = await supabase.rpc(
            "submit_attendance",
            {
                p_student_code:
                    student.student_code,

                p_code: code,
            }
        );

        if (error) {
            console.error(
                "SUBMIT ATTENDANCE ERROR:",
                error
            );

            if (
                error.message.includes(
                    "ATTENDANCE_EXPIRED"
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Đã hết lượt điểm danh.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                error.message.includes(
                    "INVALID_ATTENDANCE_CODE"
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Mã điểm danh không đúng.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                error.message.includes(
                    "STUDENT_NOT_FOUND"
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Không tìm thấy thông tin học sinh.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            return NextResponse.json(
                {
                    error:
                        "Không thể điểm danh.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Điểm danh thành công! +10 điểm.",
            pointsAdded:
                Number(data ?? 10),
        });

    } catch (error) {
        console.error(
            "STUDENT ATTENDANCE ERROR:",
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