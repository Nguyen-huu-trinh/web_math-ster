import { NextRequest, NextResponse } from "next/server";
import { CreateCourseSchema } from "@/validators/course.schema";
import { courseService } from "@/services/course.service";
import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";

export const revalidate = 0; // Tránh static caching trên server Vercel

export async function GET() {
  try {
    const profile = await requireRole([
      UserRole.STUDENT,
      UserRole.TEACHER,
    ]);

    const studentId =
      profile.role === UserRole.STUDENT ? profile.id : undefined;

    const data = await courseService.getAll(studentId);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: any) {
    console.error("GET COURSES ERROR:", err);

    return NextResponse.json(
      {
        error: err?.message || "Internal Server Error",
      },
      { status: err?.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole([UserRole.TEACHER]);
    const body = await req.json();

    const values = CreateCourseSchema.safeParse(body);
    if (!values.success) {
      return NextResponse.json({ error: "Dữ liệu khóa học không hợp lệ" }, { status: 400 });
    }
    const course = await courseService.create(values.data);

    return NextResponse.json(course, { status: 201 });
  } catch (err: any) {
    console.error("CREATE COURSE ERROR:", err);

    return NextResponse.json(
      {
        error: err?.message || "Internal Server Error",
      },
      { status: err?.status || 500 }
    );
  }
}
