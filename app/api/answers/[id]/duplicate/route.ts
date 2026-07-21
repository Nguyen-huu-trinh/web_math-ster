import { NextResponse } from "next/server";
import { answerService } from "@/services/answer.service";

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
    await answerService.duplicate(id)
  );
}