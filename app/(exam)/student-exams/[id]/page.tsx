import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  // Lấy Attempt + Exam
  // ==========================

  const {
    data: attempt,
    error,
  } = await supabase
    .from("exam_attempts")
    .select(`
      *,
      exams (
        id,
        title,
        category,
        duration_minutes,
        exam_file_url,
        show_answer,
        max_attempts,
        attendance_min_score,
        question_config,
        answer_key
      )
    `)
    .eq("id", id)
    .single();

  if (error || !attempt) {
    console.error(error);
    return notFound();
  }

  const exam = attempt.exams;

  if (!exam) {
    return notFound();
  }

  // Debug
  console.log("===========");
  console.log("Attempt:", attempt);
  console.log("Exam:", exam);
  console.log("===========");

  return (
    <StudentExamLayout
      attempt={attempt}
      exam={exam}
    />
  );
}