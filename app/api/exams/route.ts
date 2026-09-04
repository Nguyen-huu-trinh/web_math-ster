import { NextRequest, NextResponse } from "next/server";

import { examService } from "@/services/exam.service";

import { requireTeacher } from "@/lib/auth/teacher";

import { CreateExamSchema } from "@/validators/exam.schema";

export async function GET() {
  await requireTeacher();

  const exams =
    await examService.getAll();

  return NextResponse.json(exams);
}

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireTeacher();

    const body = await request.json();

    const {
      teacherId: _teacherId,
      ...examBody
    } = body;

    const validatedData =
      CreateExamSchema.parse(examBody);

    const exam =
      await examService.create(
        teacher.id,
        {
          ...validatedData,
          teacherId: teacher.id,
        }
      );

    return NextResponse.json(exam);
  } catch (error) {
    console.error("POST /api/exams ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
