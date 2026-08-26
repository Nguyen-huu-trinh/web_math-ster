import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireTeacher } from "@/lib/auth/teacher";
import { studentExamService } from "@/services/student-exam.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  try {
    await requireTeacher();

    const { id } = await params;

    const body = await request.json();

    const {
      studentId,
      action,
    } = body;

    if (!studentId) {
      return NextResponse.json(
        {
          message:
            "Thiếu mã học sinh.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      action !== "increase" &&
      action !== "decrease"
    ) {
      return NextResponse.json(
        {
          message:
            "Action không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await studentExamService.adjustStudentPoints(
        id,
        studentId,
        action
      );

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error(
      "[ADJUST STUDENT POINTS ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật điểm.",
      },
      {
        status: 500,
      }
    );
  }
}