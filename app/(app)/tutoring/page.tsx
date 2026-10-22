import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TutoringCalendar } from "@/components/tutoring/calendar";
import type { TutoringSlot } from "@/types/tutoring";
import { TeacherTutoringManager } from "@/components/tutoring/teacher-manager";

export const metadata = { title: "Đăng ký dò bài | Math-Ster" };

export default async function TutoringPage({ searchParams }: {
  searchParams: Promise<{ month?: string }>;
}) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: role } = await db.rpc("tutoring_actor_role");
  if (role !== "TEACHER" && role !== "STUDENT") redirect("/403");
  const requested = (await searchParams).month;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const month = requested && /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(requested) && !requested.startsWith("0000")
    ? requested : today.slice(0, 7);
  if (role === "TEACHER") return <TeacherTutoringManager userId={user.id} initialMonth={month} />;
  const { data, error } = await db.rpc("list_tutoring_slots", { p_month: month });
  if (error) return <p role="alert">Không thể tải lịch dò bài. Vui lòng tải lại trang.</p>;
  return <TutoringCalendar slots={(data ?? []) as TutoringSlot[]} month={month} teacher={role === "TEACHER"} userId={user.id} />;
}
