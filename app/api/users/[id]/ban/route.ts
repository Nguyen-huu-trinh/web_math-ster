import { NextResponse } from "next/server";
import { userService } from "@/services/user.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: Props
) {
  const { id } = await params;

  await userService.ban(id);

  return NextResponse.json({
    success: true,
  });
}