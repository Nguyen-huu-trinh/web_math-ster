"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3 } from "lucide-react";
import { getTeacherTutoringSlots } from "@/app/actions/tutoring";

const vietnamToday = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

export function TodayTutoringBookings({ userId }: { userId?: string }) {
  const [today, setToday] = useState(vietnamToday);
  useEffect(() => {
    const timer = setInterval(() => setToday(vietnamToday()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const month = today.slice(0, 7);
  const schedule = useQuery({
    queryKey: ["teacher-tutoring-slots", userId, month, "summary"],
    queryFn: async () => {
      const result = await getTeacherTutoringSlots(month);
      if (result.error) throw new Error(result.error);
      return { slots: result.slots, unbookedCount: result.unbookedCount ?? 0 };
    },
    enabled: !!userId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const bookings = (schedule.data?.slots ?? [])
    .filter(slot => slot.slot_date === today && slot.is_booked)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return <section aria-label="Dò bài hôm nay" className="flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-white/60 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
    <h3 className="flex shrink-0 items-center gap-2 text-sm font-bold text-amber-900">
      <Clock3 className="size-4 text-amber-600" />
      Dò bài hôm nay
    </h3>
    {schedule.isPending ? <p role="status" className="text-sm text-amber-800/65">Đang tải lịch…</p>
      : schedule.isError ? <div role="alert" className="flex items-center gap-2 text-sm text-amber-800/65">
        Không thể tải lịch.
        <button type="button" disabled={schedule.isFetching} onClick={() => void schedule.refetch()} className="font-semibold text-amber-900 underline underline-offset-2">Thử lại</button>
      </div>
      : !bookings.length ? <p className="text-sm text-amber-800/65">Hôm nay chưa có học sinh đăng ký dò bài.</p>
      : <ul className="flex min-w-0 flex-wrap gap-2">
        {bookings.map(slot => <li key={slot.id} className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-amber-200/70 bg-[#fff7e6] px-3 py-1.5 text-sm">
          <time dateTime={`${today}T${slot.start_time}+07:00`} className="font-bold tabular-nums text-amber-800">{slot.start_time.slice(0, 5)}</time>
          <span className="font-mono text-xs text-amber-800/65">{slot.student_code || "—"}</span>
          <span className="break-words font-medium text-slate-800">{slot.student_name || "Học sinh"}</span>
        </li>)}
      </ul>}
  </section>;
}
