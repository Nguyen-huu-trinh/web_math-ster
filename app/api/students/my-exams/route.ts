import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/student";
import { studentExamService } from "@/services/student-exam.service";

// Cache nhẹ ở Edge CDN trong 60 giây để tránh nghẽn khi học sinh spam reload
export const revalidate = 60;

export async function GET() {
  try {
    // 1. Kiểm tra Auth an toàn
    let student;
    try {
      student = await requireStudent();
    } catch {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Tải danh sách đề thi
    const exams = await studentExamService.getMyExams(student.id);

    // 3. Header Cache chuẩn
    return NextResponse.json(exams, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
    });

  } catch (error) {
    console.error("[GET MY EXAMS ERROR]:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể lấy danh sách đề thi.",
      },
      { status: 500 }
    );
  }
}