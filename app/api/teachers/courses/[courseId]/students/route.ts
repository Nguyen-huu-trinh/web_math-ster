import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { teacherStudentService } from "@/services/teacher-student.service";

interface RouteContext {
    params: Promise<{
        courseId: string;
    }>;
}

export async function GET(
    _request: Request,
    { params }: RouteContext
) {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const { courseId } = await params;

        if (!courseId) {
            return NextResponse.json(
                {
                    error:
                        "Thiếu courseId.",
                },
                {
                    status: 400,
                }
            );
        }

        const students =
            await teacherStudentService.getByCourse(
                courseId
            );

        return NextResponse.json(
            students
        );
    } catch (error) {
        console.error(
            "GET COURSE STUDENTS ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải danh sách học sinh của khóa học.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(
    request: Request,
    { params }: RouteContext
) {
    try {
        await requireRole([UserRole.TEACHER]);

        const { courseId } = await params;

        if (!courseId) {
            return NextResponse.json(
                { error: "Thiếu courseId." },
                { status: 400 }
            );
        }

        const body = await request.json();
        const studentIds = body?.studentIds;

        if (
            !Array.isArray(studentIds) ||
            studentIds.length === 0 ||
            studentIds.some(
                (studentId) =>
                    typeof studentId !== "string" ||
                    !studentId
            )
        ) {
            return NextResponse.json(
                { error: "studentIds không hợp lệ." },
                { status: 400 }
            );
        }

        const result =
            await teacherStudentService.addToCourse(
                courseId,
                studentIds
            );

        return NextResponse.json(result, {
            status: 201,
        });
    } catch (error) {
        console.error(
            "ADD STUDENTS TO COURSE ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể thêm học sinh vào khóa học.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: RouteContext
) {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const { courseId } = await params;

        if (!courseId) {
            return NextResponse.json(
                {
                    error: "Thiếu courseId.",
                },
                {
                    status: 400,
                }
            );
        }

        const body = await request.json();

        const studentId = body?.studentId;

        if (
            typeof studentId !== "string" ||
            !studentId
        ) {
            return NextResponse.json(
                {
                    error:
                        "Thiếu studentId.",
                },
                {
                    status: 400,
                }
            );
        }

        await teacherStudentService.removeFromCourse(
            courseId,
            studentId
        );

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(
            "REMOVE COURSE STUDENT ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể xóa học sinh khỏi khóa học.",
            },
            {
                status: 500,
            }
        );
    }
}