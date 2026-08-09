import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";
import { studentExamService } from "@/services/student-exam.service";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: Context
) {
  try {
    // ================================
    // 1. Xác thực học sinh
    // ================================
    const student = await requireStudent();

    // ================================
    // 2. Lấy attempt ID
    // ================================
    const { id } = await params;

    // ================================
    // 3. Đọc request body
    // ================================
    const body = await request.json();

    console.log("[SUBMIT] START", {
      attemptId: id,
      studentId: student.id,
    });

    // ================================
    // 4. Kiểm tra answers
    // ================================
    if (!body?.answers) {
      return NextResponse.json(
        {
          error: "Không có dữ liệu đáp án.",
        },
        {
          status: 400,
        }
      );
    }

    // ================================
    // 5. Chấm và lưu bài
    // ================================
    const result =
      await studentExamService.submitAttempt(
        student.id,
        id,
        body.answers
      );

    console.log("[SUBMIT] SUCCESS", {
      attemptId: id,
      studentId: student.id,
    });

    return NextResponse.json(result);

  } catch (err) {
    console.error(
      "[SUBMIT] ERROR",
      err
    );

    const message =
      err instanceof Error
        ? err.message
        : String(err);

    // Unauthorized
    if (
      message === "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // Các lỗi khác
    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}