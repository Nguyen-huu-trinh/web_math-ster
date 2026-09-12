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

    const studentId =
      profile.role === UserRole.STUDENT
        ? profile.id
        : undefined;

    const data = await courseService.getAll(studentId);

    // Trả về kèm Header Caching
    return NextResponse.json(data, {
      headers: {
        // Trình duyệt của user sẽ giữ cache 5 phút (300s), giảm 100% request trùng lặp lên Vercel
        "Cache-Control": "private, max-age=1800, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("GET COURSES ERROR:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await requireRole([UserRole.TEACHER]);
    const body = await req.json();

    const course = await courseService.create({
      ...body,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    console.error("CREATE COURSE ERROR:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : String(err),
      },
      { status: 500 }
    );
  }
}