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

    console.error("START EXAM ERROR:", e);

    return NextResponse.json(
      { message: e.message },
      { status: 500 }
    );
  }
}