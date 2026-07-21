import { NextRequest, NextResponse } from "next/server";
import { answerService } from "@/services/answer.service";
import { UpdateAnswerSchema } from "@/validators/answer.schema";

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
    await answerService.getById(id)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body = await request.json();

  const values =
    UpdateAnswerSchema.parse(body);

  const { id } = await params;

  return NextResponse.json(
    await answerService.update(id, values)
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  await answerService.delete(id);

  return NextResponse.json({
    success: true,
  });
}