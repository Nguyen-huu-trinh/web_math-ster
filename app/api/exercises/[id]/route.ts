import { NextRequest, NextResponse } from "next/server";
import { exerciseService } from "@/services/exercise.service";
import { UpdateExerciseSchema } from "@/validators/exercise.schema";

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
    await exerciseService.getById(id)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body =
    await request.json();

  const values =
    UpdateExerciseSchema.parse(body);

  const { id } = await params;

  return NextResponse.json(
    await exerciseService.update(
      id,
      values
    )
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  await exerciseService.delete(id);

  return NextResponse.json({
    success: true,
  });
}