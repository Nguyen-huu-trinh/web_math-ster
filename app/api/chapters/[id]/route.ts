import { NextRequest, NextResponse } from "next/server";
import { chapterService } from "@/services/chapter.service";
import { UpdateChapterSchema } from "@/validators/chapter.schema";

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
    await chapterService.getById(id)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body =
    await request.json();

  const values =
    UpdateChapterSchema.parse(
      body
    );

  const { id } = await params;

  return NextResponse.json(
    await chapterService.update(
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

  await chapterService.delete(id);

  return NextResponse.json({
    success: true,
  });
}