import { NextRequest, NextResponse } from "next/server";
import { courseEnrollmentService } from "@/services/course-enrollment.service";
import { UpdateEnrollmentStatusSchema } from "@/validators/course-enrollment.schema";

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
    await courseEnrollmentService.getById(id)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body = await request.json();

  const values =
    UpdateEnrollmentStatusSchema.parse(body);

  const { id } = await params;

  return NextResponse.json(
    await courseEnrollmentService.updateStatus(
      id,
      values.status
    )
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  await courseEnrollmentService.remove(id);

  return NextResponse.json({
    success: true,
  });
}