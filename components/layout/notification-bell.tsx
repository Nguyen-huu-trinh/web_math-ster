"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BookOpen, FileText, Megaphone, CalendarCheck, Video, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";

function relativeTime(value: string) {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (!Number.isFinite(seconds)) return "";
  if (seconds < 60) return "Vừa xong";
  const formatter = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
  if (seconds < 3600) return formatter.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return formatter.format(-Math.floor(seconds / 3600), "hour");
  return formatter.format(-Math.floor(seconds / 86400), "day");
}
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const feed = useNotifications();
  return (
    <Popover open={open} onOpenChange={(value) => {
      setOpen(value);
      if (value && (!feed.dataUpdatedAt || Date.now() - feed.dataUpdatedAt > 60_000)) void feed.refetch();
    }}>
      <PopoverTrigger aria-label={`Thông báo${feed.unreadCount ? `, ${feed.unreadCount} chưa đọc` : ""}`} className="relative flex size-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white">
        <Bell className="size-4" />
        {feed.unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white ring-2 ring-slate-900">{feed.unreadCount > 99 ? "99+" : feed.unreadCount}</span>}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={12} className="w-[420px] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-0 text-slate-800 shadow-2xl shadow-slate-900/15">
        <div className="flex items-center justify-between gap-3 border-b border-amber-100/80 bg-gradient-to-r from-amber-50/80 to-white px-4 py-4">
          <PopoverTitle className="text-base font-extrabold tracking-tight text-slate-900">Thông báo</PopoverTitle>
          <button type="button" disabled={feed.isMarking || !feed.notifications.some((item) => !item.is_read)} onClick={() => { void feed.markAllAsRead().catch(() => toast.error("Không thể đánh dấu đã đọc. Vui lòng thử lại.")); }} className="rounded-lg border border-amber-200/70 bg-white/80 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-500 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500">Đọc tất cả đang hiển thị</button>
        </div>
        <div className="max-h-[min(65dvh,480px)] overflow-y-auto space-y-2 bg-slate-50/50 p-3">
          {feed.isPending ? <p className="p-6 text-center text-sm text-slate-400">Đang tải thông báo...</p> : feed.isError ? <div className="p-5 text-center text-sm"><p>Không thể tải thông báo.</p><button type="button" onClick={() => void feed.refetch()} className="mt-2 text-amber-700">Thử lại</button></div> : feed.notifications.length === 0 ? <p className="p-6 text-center text-sm text-slate-400">Chưa có thông báo.</p> : feed.notifications.map((item) => {
            const Icon = item.type === "EXAM" ? (item.subtype === "ATTENDANCE" ? CalendarCheck : FileText) : item.type === "LESSON_MATERIAL" ? (item.subtype === "VIDEO" ? Video : item.subtype === "PDF" ? FileDown : BookOpen) : Megaphone;
            const colors = item.type === "EXAM"
              ? item.subtype === "ATTENDANCE"
                ? { surface: "border-emerald-200/70 from-emerald-50/80 to-white", accent: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" }
                : { surface: "border-amber-200/70 from-amber-50/80 to-white", accent: "bg-amber-100 text-amber-800", dot: "bg-amber-500" }
              : item.type === "LESSON_MATERIAL"
                ? { surface: "border-blue-200/70 from-blue-50/80 to-white", accent: "bg-blue-100 text-blue-800", dot: "bg-blue-500" }
                : { surface: "border-violet-200/70 from-violet-50/80 to-white", accent: "bg-violet-100 text-violet-800", dot: "bg-violet-500" };
            return <button type="button" key={item.id} onClick={() => {
              if (!item.is_read) void feed.markAsRead(item.id).catch(() => toast.error("Chưa lưu được trạng thái đã đọc."));
              setOpen(false);
              const safeLink = item.link.startsWith("/") && !item.link.startsWith("//") && !item.link.includes("\\");
              router.push(safeLink ? item.link : "/dashboard");
            }} className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${item.is_read ? "border-slate-200/70 bg-white hover:border-slate-300" : `bg-gradient-to-r ${colors.surface}`}`}>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colors.accent}`}><Icon className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className={`mb-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${colors.accent}`}>{item.type === "EXAM" ? (item.subtype === "ATTENDANCE" ? "Điểm danh" : "Định kì") : item.type === "LESSON_MATERIAL" ? (item.subtype === "VIDEO" ? "Video" : item.subtype === "PDF" ? "PDF" : "Tài liệu") : "Thông báo chung"}</span><span className="block text-[14px] font-bold leading-snug text-slate-900">{item.title}</span><span className="mt-1.5 block whitespace-pre-line break-words text-[13px] leading-relaxed text-slate-600">{item.content}</span><time dateTime={item.created_at} className="mt-2 block text-[11px] font-medium text-slate-500">{relativeTime(item.created_at)}</time></span>
              {!item.is_read && <span aria-label="Chưa đọc" className={`mt-2 size-2 shrink-0 rounded-full ring-4 ring-white ${colors.dot}`} />}
            </button>;
          })}
        </div>
        <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">20 thông báo mới nhất</p>
      </PopoverContent>
    </Popover>
  );
}
