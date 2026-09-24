"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BookOpen, FileText, Megaphone, CalendarCheck, Video, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";
import { notificationLink } from "@/lib/notification-link";

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
      <PopoverContent align="end" sideOffset={12} className="w-[460px] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-0 text-slate-800 shadow-2xl shadow-slate-900/15">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-5">
          <PopoverTitle className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-950">Thông báo{feed.unreadCount > 0 && <span aria-hidden="true" className="size-2 rounded-full bg-amber-500" />}</PopoverTitle>
          <button type="button" disabled={feed.isMarking || !feed.notifications.some((item) => !item.is_read)} onClick={() => { void feed.markAllAsRead().catch(() => toast.error("Không thể đánh dấu đã đọc. Vui lòng thử lại.")); }} className="rounded-lg py-1.5 text-xs font-bold text-amber-700 transition-colors hover:text-amber-900 focus-visible:outline-2 focus-visible:outline-amber-500 disabled:text-slate-400">Đọc tất cả đang hiển thị</button>
        </div>
        <div className="max-h-[min(65dvh,480px)] overflow-y-auto space-y-3 bg-white p-4">
          {feed.isPending ? <p className="p-6 text-center text-sm text-slate-400">Đang tải thông báo...</p> : feed.isError ? <div className="p-5 text-center text-sm"><p>Không thể tải thông báo.</p><button type="button" onClick={() => void feed.refetch()} className="mt-2 text-amber-700">Thử lại</button></div> : feed.notifications.length === 0 ? <p className="p-6 text-center text-sm text-slate-400">Chưa có thông báo.</p> : feed.notifications.map((item) => {
            const Icon = item.type === "EXAM" ? (item.subtype === "ATTENDANCE" ? CalendarCheck : FileText) : item.type === "LESSON_MATERIAL" ? (item.subtype === "VIDEO" ? Video : item.subtype === "PDF" ? FileDown : BookOpen) : Megaphone;
            const colors = item.type === "EXAM"
              ? item.subtype === "ATTENDANCE"
                ? { surface: "border-emerald-200/70 from-emerald-50/80 to-white", accent: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" }
                : { surface: "border-amber-200/70 from-amber-50/80 to-white", accent: "bg-amber-100 text-amber-800", dot: "bg-amber-500" }
              : item.type === "LESSON_MATERIAL"
                ? { surface: "border-sky-200/80 from-sky-50/60 to-white", accent: "bg-sky-100 text-sky-800", dot: "bg-sky-500" }
                : { surface: "border-violet-200/70 from-violet-50/80 to-white", accent: "bg-violet-100 text-violet-800", dot: "bg-violet-500" };
            return <button type="button" key={item.id} onClick={() => {
              if (!item.is_read) void feed.markAsRead(item.id).catch(() => toast.error("Chưa lưu được trạng thái đã đọc."));
              setOpen(false);
              router.push(notificationLink(item));
            }} className={`block w-full rounded-2xl border p-4 text-left transition-colors hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${item.is_read ? "border-slate-200 bg-white hover:bg-slate-50" : `bg-gradient-to-br ${colors.surface}`}`}>
              <span className="mb-2.5 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-extrabold uppercase ${item.is_read ? "bg-slate-100 text-slate-600" : colors.accent}`}>
                  <Icon className="size-4 shrink-0" />
                  {item.type === "EXAM" ? (item.subtype === "ATTENDANCE" ? "Điểm danh" : "Định kì") : item.type === "LESSON_MATERIAL" ? "Tài liệu" : "Thông báo chung"}
                </span>
                {!item.is_read && <span aria-label="Chưa đọc" className={`ml-auto size-2 shrink-0 rounded-full ${colors.dot}`} />}
              </span>
              <span className="block break-words text-[14.5px] font-black text-slate-900 leading-snug">{item.title}</span>
              {item.content?.trim() && <span className="block whitespace-pre-line break-words text-xs font-medium text-slate-600 mt-1 leading-relaxed">{item.content}</span>}
              <time dateTime={item.created_at} className="block text-[11.5px] font-medium text-slate-400 mt-2.5">{relativeTime(item.created_at)}</time>
            </button>;
          })}
        </div>
        <p className="border-t border-slate-100 bg-slate-50/80 px-4 py-3.5 text-center text-xs font-semibold text-slate-500">20 thông báo mới nhất</p>
      </PopoverContent>
    </Popover>
  );
}
