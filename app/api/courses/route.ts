import { NextRequest, NextResponse } from "next/server";

import { courseService } from "@/services/course.service";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";

export async function GET() {
  try {
    const profile = await requireRole([
      UserRole.STUDENT,
      UserRole.TEACHER,
    ]);

    // Học sinh → chỉ lấy khóa học mà mình được thêm vào
    const studentId =
      profile.role === UserRole.STUDENT
        ? profile.id
        : undefined;

    // Giáo viên → studentId = undefined
    // → repository sẽ lấy toàn bộ khóa học
    const data =
      await courseService.getAll(studentId);

    return NextResponse.json(data);
  } catch (err) {
    console.error(
      "GET COURSES ERROR:",
      err
    );

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : String(err),
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const profile = await requireRole([
      UserRole.TEACHER,
    ]);

    const body = await req.json();

    const course = await courseService.create({
      ...body,
      // Nếu cần, có thể dùng profile.id làm teacherId
    });

    return NextResponse.json(course, {
      status: 201,
    });
  } catch (err) {
    console.error(
      "CREATE COURSE ERROR:",
      err
    );

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : String(err),
      },
      {
        status: 500,
      }
    );
  }
}