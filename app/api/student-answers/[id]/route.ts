import { NextRequest, NextResponse } from "next/server";
import { studentAnswerService } from "@/services/student-answer.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  await studentAnswerService.delete(
    id
  );

  return NextResponse.json({
    success: true,
  });
}