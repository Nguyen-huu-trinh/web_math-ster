import { NextRequest } from "next/server";
import { z } from "zod";
import { requireTeacher } from "@/lib/auth/teacher";

import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";
import { announcementService } from "@/services/announcement.service";
import { adminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    await requireTeacher();
    const { id } = z.object({ id: z.string().uuid() }).parse(await request.json());
    // Clear the existing slot so it can be reused. Do not call save_announcement:
    // that RPC publishes a new navigation notification.
    const { data, error } = await adminClient.from("announcements")
      .update({ title: "", content: "", updated_at: new Date().toISOString() })
      .eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Không tìm thấy thông báo." }, { status: 404 });
    return success({ message: "Đã xóa thông báo." });
  } catch (error) {
    const status = (error as { status?: number })?.status;
    if (status === 401 || status === 403) return NextResponse.json({ error: "Không có quyền xóa thông báo." }, { status });
    return handleError(error);
  }
}

export async function GET() {
  try {
    const data = await announcementService.get();
    const response = success(data);

    // Fetch the latest announcement when students follow a broadcast.
    response.headers.set(
      "Cache-Control",
      "no-store"
    );

    return response;
  } catch (error) {
    console.error("GET ANNOUNCEMENT ERROR:", error);
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireTeacher();
    const body = z.object({
      id: z.string().uuid(),
      title: z.string().refine((value) => value.trim().length > 0),
      content: z.string().nullable().optional().transform((value) => value ?? ""),
    }).parse(await request.json());

    await announcementService.update(
      body.id,
      body.title,
      body.content
    );

    return success({
      message: "Announcement updated",
    });
  } catch (error) {
    return handleError(error);
  }
}
