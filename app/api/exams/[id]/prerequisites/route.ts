import { NextRequest, NextResponse } from "next/server";

import { examService } from "@/services/exam.service";

import { requireTeacher } from "@/lib/auth/teacher";

import { z } from "zod";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const AddPrerequisiteSchema = z.object({
  prerequisiteExamId: z.string().uuid(),
});

// =========================================================
// GET
// Lấy danh sách đề tiên quyết
// =========================================================

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  const prerequisites =
    await examService.getPrerequisites(id);

  return NextResponse.json(
    prerequisites
  );
}

// =========================================================
// POST
// Thêm đề tiên quyết
// =========================================================

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  const body =
    await request.json();

  const validatedData =
    AddPrerequisiteSchema.parse(body);

  const prerequisite =
    await examService.addPrerequisite(
      id,
      validatedData.prerequisiteExamId
    );

  return NextResponse.json(
    prerequisite
  );
}