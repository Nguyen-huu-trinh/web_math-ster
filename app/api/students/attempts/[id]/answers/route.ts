import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: Context
) {
  const { id } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_answers")
    .select("*")
    .eq("attempt_id", id);

  if (error) throw error;

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: Context
) {
  const { id } = await params;

  const body = await request.json();

  const supabase = await createClient();

  const { data: exist } = await supabase
    .from("exam_answers")
    .select("id")
    .eq("attempt_id", id)
    .eq("question_id", body.questionId)
    .maybeSingle();

  if (exist) {

    await supabase
      .from("exam_answers")
      .update({
        answer: body.answer,
      })
      .eq("id", exist.id);

  } else {

    await supabase
      .from("exam_answers")
      .insert({
        attempt_id: id,
        question_id: body.questionId,
        answer: body.answer,
      });

  }

  return NextResponse.json({
    success: true,
  });
}