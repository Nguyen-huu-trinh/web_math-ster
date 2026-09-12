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
  const data = await courseService.getById(id);

  return NextResponse.json(data, {
    headers: {
      // Lưu cache 30 phút (1800s) tại trình duyệt của người dùng
      "Cache-Control": "private, max-age=1800, stale-while-revalidate=60",
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  const body = await request.json();
  const values = UpdateCourseSchema.parse(body);
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