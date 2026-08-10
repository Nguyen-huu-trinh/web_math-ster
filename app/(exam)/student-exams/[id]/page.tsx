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

    let studentId = "";

    try {
        const profile =
            await requireStudent();

        studentId = profile.id;

        console.log(
            "[STUDENT EXAM PAGE] START",
            {
                attemptId: id,
                studentId: profile.id,
            }
        );

        const session =
            await studentExamService.getExamSession(
                profile.id,
                id
            );

        console.log(
            "[STUDENT EXAM PAGE] SESSION FOUND",
            {
                attemptId: id,
                studentId: profile.id,
            }
        );

        return (
            <StudentExamLayout
                session={session}
            />
        );

    } catch (error) {
        console.error(
            "[STUDENT EXAM PAGE ERROR]",
            {
                attemptId: id,
                studentId,
                error,
            }
        );

        throw error;
    }
}