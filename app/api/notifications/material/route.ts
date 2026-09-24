import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTeacher } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";
const schema = z.object({ resourceId: z.string().uuid(), requestId: z.string().uuid(), isUpdate: z.boolean().default(false) });
export async function POST(request: NextRequest) {
  try {
    await requireTeacher();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("publish_material_notification", { resource_id: parsed.data.resourceId, submission_id: parsed.data.requestId, is_update: parsed.data.isUpdate });
    if (error) return NextResponse.json({ error: "Không thể gửi thông báo." }, { status: error.code === "42501" ? 403 : error.code === "P0002" ? 404 : 500 });
    return NextResponse.json({ id: data });
  } catch (error) {
    const status = (error as { status?: number }).status;
    return NextResponse.json({ error: "Không thể gửi thông báo. Kiểm tra quyền đăng nhập." }, { status: status === 401 || status === 403 ? status : 500 });
  }
}
