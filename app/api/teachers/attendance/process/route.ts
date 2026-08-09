import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    try {
        /*
         * Chỉ yêu cầu người dùng đã đăng nhập.
         * Không kiểm tra role.
         */
        await requireAuth();

        const body =
            await request.json();

        const correctCode =
            typeof body.correctCode === "string"
                ? body.correctCode.trim()
                : "";

        if (!correctCode) {
            return NextResponse.json(
                {
                    error:
                        "Vui lòng nhập mã điểm danh đúng.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * =====================================================
         * 1. LẤY HỌC SINH ĐÃ NHẬP ĐÚNG MÃ
         * =====================================================
         */

        const {
            data: correctStudents,
            error: correctSelectError,
        } = await adminClient
            .from("attendance")
            .select("student_id")
            .eq("code", correctCode);

        if (correctSelectError) {
            throw correctSelectError;
        }

        const correctStudentIds =
            (correctStudents ?? []).map(
                (item) =>
                    item.student_id
            );

        /*
         * =====================================================
         * 2. LẤY TOÀN BỘ HỌC SINH
         * =====================================================
         */

        const {
            data: allStudents,
            error: allStudentsError,
        } = await adminClient
            .from("profiles")
            .select("id, points")
            .eq("role", "STUDENT");

        if (allStudentsError) {
            throw allStudentsError;
        }

        /*
         * =====================================================
         * 3. XỬ LÝ ĐIỂM
         *
         * Đúng mã  → +10
         * Sai mã   → -10
         * Không nhập → -10
         * =====================================================
         */

        const correctSet =
            new Set(correctStudentIds);

        for (const student of allStudents ?? []) {
            const newPoints =
                correctSet.has(student.id)
                    ? student.points + 10
                    : student.points - 10;

            const {
                error: updateError,
            } = await adminClient
                .from("profiles")
                .update({
                    points: newPoints,
                })
                .eq(
                    "id",
                    student.id
                );

            if (updateError) {
                throw updateError;
            }
        }

        /*
         * =====================================================
         * 4. XÓA TOÀN BỘ ATTENDANCE
         * =====================================================
         */

        const {
            error: deleteError,
        } = await adminClient
            .from("attendance")
            .delete()
            .neq(
                "id",
                "00000000-0000-0000-0000-000000000000"
            );

        if (deleteError) {
            throw deleteError;
        }

        /*
         * =====================================================
         * 5. TRẢ KẾT QUẢ
         * =====================================================
         */

        return NextResponse.json({
            success: true,
            message:
                "Đã xử lý điểm danh thành công.",
            correctCount:
                correctStudentIds.length,
            totalStudents:
                allStudents?.length ?? 0,
        });

    } catch (error) {
        console.error(
            "PROCESS ATTENDANCE ERROR:",
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