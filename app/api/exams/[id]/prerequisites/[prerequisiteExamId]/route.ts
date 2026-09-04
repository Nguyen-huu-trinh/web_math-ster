import { NextRequest, NextResponse } from "next/server";

import { examService } from "@/services/exam.service";

import { requireTeacher } from "@/lib/auth/teacher";

interface Props {
  params: Promise<{
    id: string;
    prerequisiteExamId: string;
  }>;
}

// =========================================================
// DELETE
// Xóa đề tiên quyết
// =========================================================

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const {
    id,
    prerequisiteExamId,
  } = await params;

  const result =
    await examService.removePrerequisite(
      id,
      prerequisiteExamId
    );

  return NextResponse.json(
    result
  );
}