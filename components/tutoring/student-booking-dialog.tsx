"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TutoringCalendar } from "@/components/tutoring/calendar";
import { getStudentTutoringSlots, getUpcomingTutoringBooking } from "@/app/actions/tutoring";
import { tutoringCache } from "@/lib/tutoring/cache";
import { toast } from "sonner";

export function StudentBookingDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit",
  }).format(new Date()));
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const upcoming = useQuery({
    queryKey: tutoringCache.key(userId, "upcoming"),
    queryFn: getUpcomingTutoringBooking,
    enabled: !!userId,
    staleTime: tutoringCache.staleTime,
    gcTime: tutoringCache.gcTime,
    refetchInterval: tutoringCache.staleTime,
    refetchOnWindowFocus: false,
  });
  const remaining = upcoming.data
    ? Date.parse(`${upcoming.data.slot_date}T${upcoming.data.start_time}+07:00`) - now : 0;
  const buttonLabel = remaining > 0
    ? remaining >= 86400000 ? `Còn ${Math.floor(remaining / 86400000)} ngày dò bài`
      : remaining >= 3600000 ? `Còn ${Math.floor(remaining / 3600000)} giờ dò bài`
        : "Còn dưới 1 giờ dò bài"
    : "Đăng ký dò bài";
  const query = useQuery({
    queryKey: tutoringCache.key(userId, month),
    queryFn: () => getStudentTutoringSlots(month),
    enabled: open && !!userId,
    staleTime: tutoringCache.staleTime,
    gcTime: tutoringCache.gcTime,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (query.isError) toast.error("Không thể cập nhật lịch. Vui lòng thử lại.", { id: "tutoring-result" });
  }, [query.isError, query.errorUpdatedAt]);
  async function refreshAfterMutation() {
    await queryClient.invalidateQueries({ queryKey: ["tutoring-slots", userId] });
  }
  return <Dialog open={open} onOpenChange={setOpen}>
    <button type="button" onClick={() => {
      if (upcoming.data && remaining > 0) setMonth(upcoming.data.slot_date.slice(0, 7));
      setOpen(true);
    }} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
      <CalendarCheck className="size-4 text-amber-400" />{buttonLabel}
    </button>
    <DialogContent className="max-h-[92dvh] w-[calc(100%-1rem)] overflow-y-auto rounded-[28px] bg-slate-50 p-4 sm:max-w-4xl sm:p-5">
      <DialogTitle className="sr-only">Đăng ký thời gian dò bài</DialogTitle>
      <DialogDescription className="sr-only">Xem lịch theo tháng, đăng ký hoặc hủy ca dò bài của bạn.</DialogDescription>
      <div className="flex flex-wrap items-center gap-3 pr-8">
        <button type="button" disabled={query.isFetching || upcoming.isFetching} onClick={() => { void query.refetch(); void upcoming.refetch(); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"><RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} />Cập nhật lịch</button>
      </div>
      {query.isPending && <p role="status" className="flex items-center gap-2 py-8 text-slate-600"><Loader2 className="size-4 animate-spin" />Đang tải lịch dò bài…</p>}
      {query.data && <TutoringCalendar slots={query.data} month={month} teacher={false} userId={userId} onMonthChange={setMonth} onUpdated={refreshAfterMutation} />}
    </DialogContent>
  </Dialog>;
}
