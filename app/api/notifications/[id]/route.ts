import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { UserRole } from "@/lib/auth/roles";
import { adminClient } from "@/lib/supabase/admin";
import { handleError } from "@/lib/api/handle-error";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole([UserRole.TEACHER]);
    const { id } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Mã thông báo không hợp lệ." }, { status: 400 });
    }
    const { data, error } = await adminClient.from("notifications").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Thông báo không còn tồn tại." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = (error as { status?: number })?.status;
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: "Bạn không có quyền xóa thông báo." }, { status });
    }
    return handleError(error);
  }
}
