import { NextRequest, NextResponse } from "next/server";
import { attemptService } from "@/services/attempt.service";
import { UpdateScoreSchema } from "@/validators/attempt.schema";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body = await request.json();

  const values =
    UpdateScoreSchema.parse(body);

  const { id } = await params;

  return NextResponse.json(
    await attemptService.updateScore(
      id,
      values.score
    )
  );
}