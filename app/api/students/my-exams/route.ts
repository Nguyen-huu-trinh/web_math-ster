import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/student";
import { studentExamService } from "@/services/student-exam.service";

// Ép buộc Route Handler này là Dynamic (đúng bản chất API đọc cookie cá nhân)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Kiểm tra Auth an toàn
    let student;
    try {
      student = await requireStudent();
    } catch {
      // Trả về 401 nhẹ nhàng kèm Cache-Control no-store để browser không lưu cache lỗi Auth
      return NextResponse.json(
        { error: "Unauthorized" },
        { 
          status: 401,
          headers: { "Cache-Control": "no-store, max-age=0" }
        }
      );
    }

    // 2. Tải danh sách đề thi từ Service
    const exams = await studentExamService.getMyExams(student.id);

    // 3. Trả về kết quả kèm Header Cache chỉ dành riêng cho Browser của học sinh đó (private)
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