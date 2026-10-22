import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/require-role";
import { UserRole } from "@/lib/auth/roles";
import { HttpError } from "@/lib/api/http-error";

export async function deleteStudentAccount(studentId: string): Promise<void> {
  await requireRole([UserRole.TEACHER]);
  if (!z.uuid().safeParse(studentId).success) throw new HttpError(400, "Mã học sinh không hợp lệ.");

  // Verify the target before using the service-role Auth API. Include disabled
  // and soft-deleted profiles, but never allow deleting teachers or admins.
  const { data: student, error: lookupError } = await adminClient
    .from("profiles").select("id,role").eq("id", studentId).maybeSingle();
  if (lookupError) throw new HttpError(500, "Không thể kiểm tra thông tin học sinh. Vui lòng thử lại.");
  if (!student) throw new HttpError(404, "Không tìm thấy hồ sơ học sinh.");
  if (student.role !== "STUDENT") throw new HttpError(403, "Chỉ được xóa tài khoản học sinh.");

  // Delete Auth first: profiles.id references auth.users.id ON DELETE CASCADE.
  // Never delete the profile separately: an Auth/Storage/FK failure must leave
  // the profile intact rather than orphaning a still-valid login account.
  const { error } = await adminClient.auth.admin.deleteUser(student.id, false);
  if (error) {
    console.error("DELETE STUDENT AUTH ERROR:", { code: error.code, status: error.status });
    throw new HttpError(500, "Không thể xóa tài khoản Supabase Auth. Hồ sơ chưa bị xóa. Vui lòng thử lại.");
  }
}
