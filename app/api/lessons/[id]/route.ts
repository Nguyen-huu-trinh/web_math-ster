import { NextRequest, NextResponse } from "next/server";
import { lessonService } from "@/services/lesson.service";
import { UpdateLessonSchema } from "@/validators/lesson.schema";

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
    await lessonService.getById(id)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body = await request.json();

  const values =
    UpdateLessonSchema.parse(body);

  const { id } = await params;

  return NextResponse.json(
    await lessonService.update(id, values)
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  await lessonService.delete(id);

  return NextResponse.json({
    success: true,
  });
}