import { NextRequest, NextResponse } from "next/server";

import { examService } from "@/services/exam.service";

import { requireTeacher } from "@/lib/auth/teacher";

import {
  UpdateExamSchema,
} from "@/validators/exam.schema";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  return NextResponse.json(
    await examService.getById(id)
  );
}

// ===== PUT =====

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  const body =
    await request.json();

  const validatedData =
    UpdateExamSchema.parse(body);

  return NextResponse.json(
    await examService.update(
      id,
      validatedData
    )
  );
}

// ===== PATCH =====

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  const body =
    await request.json();

  const validatedData =
    UpdateExamSchema.parse(body);

  return NextResponse.json(
    await examService.update(
      id,
      validatedData
    )
  );
}

// ===== DELETE =====

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  return NextResponse.json(
    await examService.softDelete(id)
  );
}