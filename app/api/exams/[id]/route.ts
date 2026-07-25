import { NextRequest, NextResponse } from "next/server";

import { examService } from "@/services/exam.service";
import { requireTeacher } from "@/lib/auth/teacher";

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

  const body = await request.json();

  return NextResponse.json(
    await examService.update(id, body)
  );
}

// ===== PATCH =====
export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  const body = await request.json();

  return NextResponse.json(
    await examService.update(id, body)
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