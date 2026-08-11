import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { teacherStudentService } from "@/services/teacher-student.service";

interface Context {
    params: Promise<{
        studentId: string;
    }>;
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
            points?: number;
            rewardMoney?: number;
        } = {};

        if (
            body.points !== undefined
        ) {
            const points =
                Number(body.points);

            if (
                !Number.isFinite(points) ||
                points < 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Points không hợp lệ.",
                    },
                    { status: 400 }
                );
            }

            values.points = points;
        }

        if (
            body.rewardMoney !== undefined
        ) {
            const rewardMoney =
                Number(
                    body.rewardMoney
                );

            if (
                !Number.isFinite(
                    rewardMoney
                ) ||
                rewardMoney < 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Reward không hợp lệ.",
                    },
                    { status: 400 }
                );
            }

            values.rewardMoney =
                rewardMoney;
        }

        if (
            Object.keys(values).length ===
            0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Không có dữ liệu cần cập nhật.",
                },
                { status: 400 }
            );
        }

        const result =
            await teacherStudentService
                .updateFinancialInfo(
                    studentId,
                    values
                );

        return NextResponse.json({
            success: true,
            student: result,
        });
    } catch (error) {
        console.error(
            "UPDATE STUDENT FINANCIAL ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể cập nhật thông tin.",
            },
            {
                status: 500,
            }
        );
    }
}