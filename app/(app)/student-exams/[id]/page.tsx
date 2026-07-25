import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

import StudentExamLayout from "./student-exam-layout";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentExamPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  // ==========================
  // Attempt + Exam
  // ==========================

  const { data: attempt, error } =
    await supabase
      .from("exam_attempts")
      .select(`
        *,
        exams (
          id,
          title,
          duration_minutes,
          show_answer,
          exam_file_url,
          max_attempts,
          attendance_min_score,
          category
        )
      `)
      .eq("id", id)
      .single();

  if (error || !attempt) {
    notFound();
  }

  // ==========================
  // Questions
  // ==========================

  const {
    data: questions,
    error: questionError,
  } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("exam_id", attempt.exam_id)
    .order("question_number");

  if (questionError) {
    console.error(questionError);
  }

  // ==========================
  // Exam object
  // ==========================

  const exam = attempt.exams;

  return (
    <StudentExamLayout
      attempt={attempt}
      exam={exam}
      questions={questions ?? []}
    />
  );
}