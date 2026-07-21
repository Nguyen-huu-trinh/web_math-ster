import { NextResponse } from "next/server";
import { userService } from "@/services/user.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: Props
) {
  const { id } = await params;

  return NextResponse.json(
    await userService.getProfile(id)
  );
}

export async function PATCH(
  request: Request,
  { params }: Props
) {
  const body = await request.json();

  const { id } = await params;

  return NextResponse.json(
    await userService.updateProfile(id, body)
  );
}

export async function DELETE(
  request: Request,
  { params }: Props
) {
  const { id } = await params;

  await userService.delete(id);

  return NextResponse.json({
    success: true,
  });
}