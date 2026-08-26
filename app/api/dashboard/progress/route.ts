import { NextResponse } from "next/server";

import { requireProfile } from "@/lib/auth/require-profile";
import { UserRole } from "@/lib/auth/roles";
import { studentExamRepository } from "@/repositories/student-exam.repository";

export async function GET() {
  try {
    const profile = await requireProfile();

    if (profile.role !== UserRole.STUDENT) {
      return NextResponse.json(
        {
          message: "Chỉ học sinh mới có thể xem dữ liệu này.",
        },
        {
          status: 403,
        }
      );
    }

    const data =
      await studentExamRepository.getPeriodicProgress(
        profile.id
      );

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "[STUDENT PROGRESS API ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy dữ liệu tiến bộ.",
      },
      {
        status: 500,
      }
    );
  }
}