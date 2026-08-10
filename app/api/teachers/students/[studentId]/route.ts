import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { teacherStudentService } from "@/services/teacher-student.service";

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
            student
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

        const values: {
            personalEmail?: string | null;
            points?: number;
            rewardMoney?: number;
        } = {};

        if (
            body.personalEmail !==
            undefined
        ) {
            values.personalEmail =
                body.personalEmail
                    ? String(
                          body.personalEmail
                      ).trim()
                    : null;
        }

        if (
            body.points !== undefined
        ) {
            const points =
                Number(body.points);

            if (
                !Number.isFinite(points)
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Points không hợp lệ.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            values.points = points;
        }

        if (
            body.rewardMoney !==
            undefined
        ) {
            const rewardMoney =
                Number(
                    body.rewardMoney
                );

            if (
                !Number.isFinite(
                    rewardMoney
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Reward money không hợp lệ.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            values.rewardMoney =
                rewardMoney;
        }

        const updated =
            await teacherStudentService.update(
                studentId,
                values
            );

        return NextResponse.json(
            updated
        );
    } catch (error) {
        console.error(
            "UPDATE TEACHER STUDENT ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể cập nhật học sinh.",
            },
            {
                status: 500,
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