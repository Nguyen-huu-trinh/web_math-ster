import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";

import { studentExamService } from "@/services/student-exam.service";

export async function GET() {
  const student = await requireStudent();

  const exams = await studentExamService.getMyExams(student.id);

  return NextResponse.json(exams, {
    headers: {
      // Trình duyệt của học sinh tự cache 10 phút (600s), giảm 100% request trùng lặp khi bấm qua lại các trang
      "Cache-Control": "private, max-age=1800, stale-while-revalidate=600",
    },
  });
}