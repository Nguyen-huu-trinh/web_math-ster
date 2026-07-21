import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/services/document.service";
import { UpdateDocumentSchema } from "@/validators/document.schema";

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
    await documentService.getById(id)
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  const body =
    await request.json();

  const values =
    UpdateDocumentSchema.parse(
      body
    );

  const { id } = await params;

  return NextResponse.json(
    await documentService.update(
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

  await documentService.delete(id);

  return NextResponse.json({
    success: true,
  });
}