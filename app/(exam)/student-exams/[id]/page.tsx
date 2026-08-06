import { notFound } from "next/navigation";

import StudentExamLayout from "./student-exam-layout";

import { requireStudent } from "@/lib/auth/student";
import { studentExamService } from "@/services/student-exam.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentExamPage({
  params,
}: Props) {
  const { id } = await params;

  try {
    const profile = await requireStudent();

    const session =
      await studentExamService.getExamSession(
        profile.id,
        id
      );
     
    return (
      <StudentExamLayout
        session={session}
      />
    );
  } catch (error) {
    console.error(
      "StudentExamPage:",
      error
    );

    return notFound();
  }
}