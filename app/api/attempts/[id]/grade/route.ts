import { NextResponse } from "next/server";
import { gradingService } from "@/services/grading.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: Props
) {
  const { id } = await params;

  const result =
    await gradingService.gradeAttempt(id);

  return NextResponse.json(result);
}