import { NextRequest, NextResponse } from "next/server";
import { attemptService } from "@/services/attempt.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  return NextResponse.json(
    await attemptService.getById(id)
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  await attemptService.delete(id);

  return NextResponse.json({
    success: true,
  });
}