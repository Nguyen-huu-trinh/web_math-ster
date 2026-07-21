import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { answerService } from "@/services/answer.service";

const Schema = z.object({
  answer_no: z.number().int().positive(),
});

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  const body = await request.json();

  const { answer_no } =
    Schema.parse(body);

  const { id } = await params;

  return NextResponse.json(
    await answerService.reorder(
      id,
      answer_no
    )
  );
}