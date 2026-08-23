import { redirect } from "next/navigation";

import StudentExamLayout from "./student-exam-layout";

import { requireProfile } from "@/lib/auth/require-profile";
import { studentExamService } from "@/services/student-exam.service";
import { UserRole } from "@/lib/auth/roles";

interface Props {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    review?: string;
  }>;
}

export default async function StudentExamPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { review } = await searchParams;

  const isReview =
    review === "true";

  const profile =
    await requireProfile();

  // =====================================================
  // GIÁO VIÊN
  // =====================================================

  if (
    profile.role === UserRole.TEACHER &&
    isReview
  ) {
    const session =
      await studentExamService.getTeacherExamSession(
        id
      );

    return (
      <StudentExamLayout
        session={session}
        review={true}
        viewerRole={profile.role}
      />
    );
  }

  // =====================================================
  // HỌC SINH
  // =====================================================

  if (
    profile.role !== UserRole.STUDENT
  ) {
    redirect("/dashboard");
  }

  const session =
    await studentExamService.getExamSession(
      profile.id,
      id
    );

  return (
    <StudentExamLayout
      session={session}
      review={isReview}
    />
  );
}