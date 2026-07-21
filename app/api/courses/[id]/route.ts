import { NextRequest, NextResponse } from "next/server";
import { courseService } from "@/services/course.service";
import { UpdateCourseSchema } from "@/validators/course.schema";

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
    await courseService.getById(id)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body = await request.json();

  const values =
    UpdateCourseSchema.parse(body);

  const { id } = await params;

  return NextResponse.json(
    await courseService.update(id, values)
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  await courseService.delete(id);

  return NextResponse.json({
    success: true,
  });
}