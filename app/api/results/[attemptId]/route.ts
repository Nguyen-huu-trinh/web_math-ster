import { NextRequest, NextResponse } from "next/server";
import { resultService } from "@/services/result.service";

interface Props {
  params: Promise<{
    attemptId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { attemptId } = await params;

  return NextResponse.json(
    await resultService.getAttemptResult(
      attemptId
    )
  );
}