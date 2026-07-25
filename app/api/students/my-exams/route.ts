import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";

import { studentExamService } from "@/services/student-exam.service";

export async function GET() {
  const student = await requireStudent();

  const exams =
    await studentExamService.getMyExams(
      student.id
    );

  return NextResponse.json(exams);
}