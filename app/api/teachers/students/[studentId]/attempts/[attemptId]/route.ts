import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { teacherStudentService } from "@/services/teacher-student.service";

interface Context {
    params: Promise<{
        studentId: string;
        attemptId: string;
    }>;
}

export async function DELETE(
    request: Request,
    { params }: Context
) {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const {
            studentId,
            attemptId,
        } = await params;

        await teacherStudentService.deleteAttempt(
            studentId,
            attemptId
        );

        return NextResponse.json({
            success: true,
            message:
                "Đã xóa lượt làm bài.",
        });
    } catch (error) {
        console.error(
            "DELETE STUDENT ATTEMPT ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể xóa lượt làm.",
            },
            {
                status: 500,
            }
        );
    }
}