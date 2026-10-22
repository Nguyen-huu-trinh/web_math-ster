"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tutoringBatch, tutoringInput as slotInput } from "@/lib/tutoring/import";
import type { TutoringSlot } from "@/types/tutoring";

export async function mutateTutoringSlot(form: FormData): Promise<{ ok: boolean; message: string }> {
  try {
    const db = await createClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { ok: false, message: "Vui lòng đăng nhập lại." };
    let successMessage = "Đã cập nhật lịch dò bài.";
    const operation = z.enum(["create", "toggle", "delete", "book", "cancel", "release", "import", "bulk", "lock_month"]).parse(form.get("operation"));
    if (operation === "book" || operation === "cancel") {
      const id = z.uuid().parse(form.get("id"));
      const { error } = await db.rpc(operation === "book" ? "book_tutoring_slot" : "cancel_tutoring_slot", { p_slot_id: id });
      if (error) return { ok: false, message: error.code === "P0001" ? error.message : "Không thể thực hiện. Vui lòng tải lại lịch và thử lại." };
    } else {
      const { data: role, error: roleError } = await db.rpc("tutoring_actor_role");
      if (roleError || role !== "TEACHER") return { ok: false, message: "Chỉ giáo viên được quản lý ca." };
      if (operation === "lock_month") {
        const month = z.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/).parse(form.get("month"));
        const { error } = await db.from("tutoring_slots").update({ is_active: false }).eq("month_key", month);
        if (error) return { ok: false, message: "Không thể khóa các ca trong tháng. Vui lòng thử lại." };
      } else if (operation === "bulk") {
        const action = z.enum(["delete", "lock", "release"]).parse(form.get("bulk_action"));
        const entries = z.array(z.object({ id: z.uuid(), student_id: z.uuid().nullable() })).min(1).max(500).parse(JSON.parse(String(form.get("selection"))));
        const ids = [...new Set(entries.map(entry => entry.id))];
        const { data, error } = await db.rpc("bulk_tutoring_slots", { p_action: action, p_selection: entries });
        if (error) return { ok: false, message: "Không thể cập nhật các ca đã chọn. Vui lòng tải lại và thử lại." };
        const count = Number(data ?? 0);
        if (count === 0) return { ok: false, message: "Không có ca phù hợp để cập nhật. Vui lòng tải lại lịch." };
        successMessage = `Đã ${action === "delete" ? "xóa" : action === "lock" ? "khóa" : "hủy đặt"} ${count}/${ids.length} ca đã chọn.${count < ids.length ? " Các ca không phù hợp hoặc đã thay đổi được giữ nguyên." : ""}`;
      } else if (operation === "import") {
        const raw = String(form.get("rows") ?? "");
        if (raw.length > 1500000) return { ok: false, message: "Dữ liệu nhập quá lớn." };
        const rows = tutoringBatch.parse(JSON.parse(raw));
        const { error } = await db.from("tutoring_slots").insert(rows);
        if (error) return { ok: false, message: error.code === "23505" ? "Có ca trùng lịch hiện có. Chưa nhập dòng nào; hãy sửa tệp và thử lại." : "Không thể nhập lịch. Chưa nhập dòng nào." };
      } else if (operation === "create") {
        const input = slotInput.parse(Object.fromEntries(form));
        const { error } = await db.from("tutoring_slots").insert(input);
        if (error) return { ok: false, message: error.code === "23505" ? "Ngày và giờ này đã có ca." : "Không thể tạo ca. Kiểm tra dữ liệu và thử lại." };
      } else {
        const id = z.uuid().parse(form.get("id"));
        // A booked slot cannot be deleted through this UI.
        const query = operation === "delete"
          ? db.from("tutoring_slots").delete().eq("id", id).is("student_id", null)
          : operation === "release"
            ? db.from("tutoring_slots").update({ student_id: null, booked_at: null }).eq("id", id).eq("student_id", z.uuid().parse(form.get("student_id")))
            : db.from("tutoring_slots").update({ is_active: z.enum(["true", "false"]).parse(form.get("active")) === "true" }).eq("id", id);
        const { data, error } = await query.select("id").single();
        if (error || !data) return { ok: false, message: "Ca đã thay đổi hoặc không thể thực hiện thao tác này." };
      }
    }
    revalidatePath("/tutoring");
    revalidatePath("/dashboard");
    return { ok: true, message: successMessage };
  } catch (error) {
    return { ok: false, message: error instanceof z.ZodError ? error.issues[0]?.message ?? "Dữ liệu không hợp lệ." : "Có lỗi xảy ra. Vui lòng thử lại." };
  }
}

export async function getTeacherTutoringSlots(month: string): Promise<{ slots: TutoringSlot[]; unbookedCount?: number; error?: string }> {
  const db = await createClient();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return { slots: [], error: "Tháng không hợp lệ." };
  const [schedule, count] = await Promise.all([
    db.rpc("teacher_tutoring_slots", { p_month: month }),
    db.rpc("teacher_tutoring_unbooked_count", { p_month: month }),
  ]);
  if (schedule.error || count.error) return { slots: [], error: "Không thể tải lịch và thống kê. Vui lòng thử lại." };
  return { slots: (schedule.data ?? []) as TutoringSlot[], unbookedCount: Number(count.data ?? 0) };
}

export async function getStudentTutoringSlots(month: string): Promise<TutoringSlot[]> {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Tháng không hợp lệ.");
  const db = await createClient();
  const { data, error } = await db.rpc("list_tutoring_slots", { p_month: month });
  if (error) throw new Error("Không thể tải lịch dò bài. Vui lòng thử lại.");
  return (data ?? []) as TutoringSlot[];
}

export async function getUpcomingTutoringBooking(): Promise<{ slot_date: string; start_time: string } | null> {
  const db = await createClient();
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) throw new Error("Vui lòng đăng nhập lại.");
  const vietnamNow = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString();
  const today = vietnamNow.slice(0, 10);
  const time = vietnamNow.slice(11, 23);
  const { data, error } = await db.from("tutoring_slots")
    .select("slot_date,start_time").eq("student_id", user.id)
    .or(`slot_date.gt.${today},and(slot_date.eq.${today},start_time.gt.${time})`)
    .order("slot_date").order("start_time").limit(1).maybeSingle();
  if (error) throw new Error("Không thể tải lịch đã đăng ký.");
  return data;
}
