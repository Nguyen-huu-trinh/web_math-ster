import { NextRequest, NextResponse } from "next/server";
import { videoService } from "@/services/video.service";
import { UpdateVideoSchema } from "@/validators/video.schema";

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
    await videoService.getById(id)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body =
    await request.json();

  const values =
    UpdateVideoSchema.parse(body);

  const { id } = await params;

  return NextResponse.json(
    await videoService.update(
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

  await videoService.delete(id);

  return NextResponse.json({
    success: true,
  });
}