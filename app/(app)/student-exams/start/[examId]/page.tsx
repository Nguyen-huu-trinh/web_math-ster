import { redirect } from "next/navigation";

import { studentExamService } from "@/services/student-exam.service";
import { requireStudent } from "@/lib/auth/student";

interface Props {
  params: Promise<{
    examId: string;
  }>;
}

export default async function StartExamPage({
  params,
}: Props) {
  const { examId } = await params;

  const student = await requireStudent();

  const attempt =
    await studentExamService.startExam(
      examId,
      student.id
    );

  redirect(`/student-exams/${attempt.id}`);
}