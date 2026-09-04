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
    const student = await requireStudent();

    const { id } = await params;

    const attempt =
      await studentExamService.startExam(
        id,
        student.id
      );

    return NextResponse.json(attempt);

  } catch (e: any) {
    console.error(
      "START EXAM ERROR:",
      e
    );

    const message =
      e?.message ?? String(e);

    // =====================================================
    // ĐÃ CÓ MỘT ATTEMPT CHƯA NỘP
    // =====================================================

    if (
      message.includes(
        "exam_attempts_one_unsubmitted_per_student_exam"
      ) ||
      message.includes(
        "duplicate key value violates unique constraint"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "EXAM_IN_PROGRESS",
          message:
            "Bài thi đang được diễn ra. Bạn đã có một lượt làm bài chưa nộp.",
        },
        {
          status: 409,
        }
      );
    }

    // =====================================================
// CHƯA HOÀN THÀNH ĐỀ TIÊN QUYẾT
// =====================================================

if (
  e?.code ===
  "PREREQUISITE_NOT_COMPLETED"
) {
  return NextResponse.json(
    {
      success: false,
      code: "PREREQUISITE_NOT_COMPLETED",
      message:
        "Bạn cần làm các bài kiểm tra tiên quyết trước khi làm bài này.",
      missingPrerequisites:
        e.missingPrerequisites ?? [],
    },
    {
      status: 403,
    }
  );
}
    // =====================================================
    // LỖI KHÁC
    // =====================================================

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}