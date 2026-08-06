import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: Context
) {
  const { id } = await params;

  const body = await request.json();

  const supabase = await createClient();

  const { error } = await supabase
    .from("exam_attempts")
    .update({
      answers: body.answers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
  });
}