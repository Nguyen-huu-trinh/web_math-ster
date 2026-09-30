import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { teacherStudentService } from "@/services/teacher-student.service";
import { UpdateTeacherStudentSchema } from "@/validators/teacher-student.schema";

interface Context {
    params: Promise<{
        studentId: string;
    }>;
}

export async function GET(
    request: Request,
    { params }: Context
) {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const { studentId } =
            await params;

        const student =
            await teacherStudentService.getById(
                studentId
            );

        return NextResponse.json(
            student,
            {
                headers: {
                    // Cache private 3 phút (180s) tại trình duyệt của Giáo viên
                    "Cache-Control": "private, max-age=180, stale-while-revalidate=30",
                },
            }
        );
    } catch (error) {
        console.error(
            "GET TEACHER STUDENT ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải học sinh.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: Context
) {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const { studentId } =
            await params;

        const body =
            await request.json();

        const result = UpdateTeacherStudentSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0]?.message ?? "Thông tin học sinh không hợp lệ." },
                { status: 400 }
            );
        }

        const updated =
            await teacherStudentService.update(
                studentId,
                result.data
            );

        return NextResponse.json(
            updated
        );
    } catch (error) {
        console.error(
            "UPDATE TEACHER STUDENT ERROR:",
            error
        );

        const status = error instanceof SyntaxError
            ? 400
            : typeof error === "object" && error !== null &&
                "status" in error && error.status === 403
                ? 403
                : 500;

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể cập nhật học sinh.",
            },
            {
                status,
            }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: Context
) {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const { studentId } =
            await params;

        await teacherStudentService.delete(
            studentId
        );

        return NextResponse.json({
            success: true,
            message:
                "Đã xóa học sinh.",
        });
    } catch (error) {
        console.error(
            "DELETE TEACHER STUDENT ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể xóa học sinh.",
            },
            {
                status: 500,
            }
        );
    }
}
