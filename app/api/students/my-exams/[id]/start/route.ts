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
  const student = await requireStudent();

  const { id } = await params;

  const attempt =
    await studentExamService.startExam(
      student.id,
      id
    );

  return NextResponse.json(attempt);
}