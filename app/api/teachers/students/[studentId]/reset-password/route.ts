import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(_request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    await requireRole([UserRole.TEACHER]);
    const { studentId } = await params;
    if (!z.string().uuid().safeParse(studentId).success) {
      return NextResponse.json({ error: "Mã học sinh không hợp lệ." }, { status: 400 });
    }
    // Check student role and visibility using the authenticated client before admin access.
    const supabase = await createClient();
    const { data: student, error: lookupError } = await supabase.from("profiles").select("id").eq("id", studentId).eq("role", "STUDENT").is("deleted_at", null).maybeSingle();
    if (lookupError) throw lookupError;
    if (!student) return NextResponse.json({ error: "Không tìm thấy học sinh." }, { status: 404 });
    const { error } = await adminClient.auth.admin.updateUserById(student.id, { password: "123456" });
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Đã reset mật khẩu về 123456." });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && (error.status === 401 || error.status === 403) ? error.status : 500;
    return NextResponse.json({ error: status === 500 ? "Không thể reset mật khẩu. Vui lòng thử lại." : "Bạn không có quyền thực hiện thao tác này." }, { status });
  }
}
