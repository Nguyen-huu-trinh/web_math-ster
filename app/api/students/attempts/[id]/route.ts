import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";
import { studentExamService } from "@/services/student-exam.service";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: Context
) {
  const student = await requireStudent();

  const { id } = await params;

  const data =
    await studentExamService.getAttemptDetail(
      student.id,
      id
    );

  return NextResponse.json(data);
}