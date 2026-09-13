import { NextRequest, NextResponse } from "next/server";
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
        // Cache ở Browser 60 giây, CDN SWR 5 phút (300s) giúp dữ liệu cập nhật linh hoạt hơn
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
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

    const course = await courseService.create(body);

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