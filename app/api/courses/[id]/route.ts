import { NextRequest, NextResponse } from "next/server";
import { courseService } from "@/services/course.service";
import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { UpdateCourseSchema } from "@/validators/course.schema";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };

function failure(error: unknown) {
  const err = error as { message?: string; status?: number };
  return NextResponse.json(
    { error: err?.message || "Không thể xử lý khóa học" },
    { status: err?.status || 500 }
  );
}

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const profile = await requireRole([UserRole.STUDENT, UserRole.TEACHER]);
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }
    const course = profile.role === UserRole.STUDENT
      ? (await courseService.getAll(profile.id)).find((item: { id: string }) => item.id === id)
      : await courseService.getById(id);
    if (!course) return NextResponse.json({ error: "Không tìm thấy khóa học" }, { status: 404 });
    return NextResponse.json(course, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    await requireRole([UserRole.TEACHER]);
    const { id } = await params;
    const values = UpdateCourseSchema.safeParse(await req.json());
    if (!z.uuid().safeParse(id).success || !values.success) {
      return NextResponse.json({ error: "Dữ liệu khóa học không hợp lệ" }, { status: 400 });
    }
    if (!Object.keys(values.data).length) {
      return NextResponse.json({ error: "Không có dữ liệu cập nhật" }, { status: 400 });
    }
    const course = await courseService.update(id, values.data);
    if (!course) return NextResponse.json({ error: "Không tìm thấy khóa học" }, { status: 404 });
    return NextResponse.json(course);
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    await requireRole([UserRole.TEACHER]);
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }
    const course = await courseService.delete(id);
    if (!course) return NextResponse.json({ error: "Không tìm thấy khóa học" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
