import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { teacherStudentService } from "@/services/teacher-student.service";

export async function GET() {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const students =
            await teacherStudentService.getAll();

        return NextResponse.json(
            students
        );
    } catch (error) {
        console.error(
            "GET TEACHER STUDENTS ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải danh sách học sinh.",
            },
            {
                status: 500,
            }
        );
    }
}