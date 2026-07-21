import { NextResponse } from "next/server";
import { attemptService } from "@/services/attempt.service";

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

  return NextResponse.json(
    await attemptService.submit(id)
  );
}