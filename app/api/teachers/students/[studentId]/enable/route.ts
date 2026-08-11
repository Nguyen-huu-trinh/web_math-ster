import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { teacherStudentService } from "@/services/teacher-student.service";

interface Context {
    params: Promise<{
        studentId: string;
    }>;
}

export async function POST(
    request: Request,
    { params }: Context
) {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const { studentId } =
            await params;

        console.log(
            "[ENABLE] studentId:",
            studentId
        );

        const result =
            await teacherStudentService.enable(
                studentId
            );

        return NextResponse.json({
            success: true,
            message:
                "Đã kích hoạt học sinh.",
            student: result,
        });
    } catch (error) {
        console.error(
            "ENABLE STUDENT ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể kích hoạt học sinh.",
            },
            {
                status: 500,
            }
        );
    }
}