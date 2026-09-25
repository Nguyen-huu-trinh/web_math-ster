"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  FileText,
  Megaphone,
  CalendarCheck,
  Video,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover";
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
  const queryClient = useQueryClient();
  const feed = useNotifications();

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value && (!feed.dataUpdatedAt || Date.now() - feed.dataUpdatedAt > 60_000)) {
          void feed.refetch();
        }
      }}
    >
      <PopoverTrigger
        aria-label={`Thông báo${feed.unreadCount ? `, ${feed.unreadCount} chưa đọc` : ""}`}
        className="relative flex size-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
      >
        <Bell className="size-4" />
        {feed.unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white ring-2 ring-slate-900">
            {feed.unreadCount > 99 ? "99+" : feed.unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-[440px] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-[26px] border border-slate-100 bg-white p-0 text-slate-800 shadow-2xl shadow-slate-900/10"
      >
        {/* Header popover */}
        <div className="flex items-center justify-between border-b border-slate-100/90 bg-white px-6 py-4.5">
          <PopoverTitle className="flex items-center gap-2 text-[17px] font-black tracking-tight text-slate-900">
            Thông báo
            {feed.unreadCount > 0 && (
              <span aria-hidden="true" className="size-2 rounded-full bg-[#f59e0b]" />
            )}
          </PopoverTitle>

          <button
            type="button"
            disabled={feed.isMarking || !feed.notifications.some((item) => !item.is_read)}
            onClick={() => {
              void feed.markAllAsRead().catch(() =>
                toast.error("Không thể đánh dấu đã đọc. Vui lòng thử lại.")
              );
            }}
            className="text-xs font-black text-[#c27803] hover:text-[#9a5b00] disabled:text-slate-300 transition-colors"
          >
            Đọc tất cả
          </button>
        </div>

        {/* Danh sách thông báo */}
        <div className="max-h-[min(65dvh,480px)] overflow-y-auto divide-y divide-slate-100/80 bg-white">
          {feed.isPending ? (
            <p className="p-8 text-center text-xs font-semibold text-slate-400">
              Đang tải thông báo...
            </p>
          ) : feed.isError ? (
            <div className="p-6 text-center text-xs">
              <p className="text-slate-500">Không thể tải thông báo.</p>
              <button
                type="button"
                onClick={() => void feed.refetch()}
                className="mt-2 font-bold text-amber-600 hover:underline"
              >
                Thử lại
              </button>
            </div>
          ) : feed.notifications.length === 0 ? (
            <p className="p-8 text-center text-xs font-semibold text-slate-400">
              Chưa có thông báo nào.
            </p>
          ) : (
            feed.notifications.map((item) => {
              let Icon = BookOpen;
              let badgeLabel = "";
              let styles = {
                unreadRowBg: "bg-sky-50/40 hover:bg-sky-50/70",
                iconBg: "bg-sky-100/70 text-[#0284c7]",
                badgeBg: "bg-sky-100/80 text-[#0284c7]",
                dot: "bg-[#0284c7]",
              };

              if (item.type === "EXAM") {
                if (item.subtype === "ATTENDANCE") {
                  Icon = CalendarCheck;
                  badgeLabel = "ĐIỂM DANH";
                  styles = {
                    unreadRowBg: "bg-[#f0fdf4]/50 hover:bg-[#f0fdf4]/80",
                    iconBg: "bg-[#dcfce7] text-[#059669]",
                    badgeBg: "bg-[#dcfce7] text-[#059669]",
                    dot: "bg-[#10b981]",
                  };
                } else {
                  Icon = FileText;
                  badgeLabel = "ĐỊNH KÌ";
                  styles = {
                    unreadRowBg: "bg-[#fffbeb]/50 hover:bg-[#fffbeb]/80",
                    iconBg: "bg-[#fef3c7] text-[#d97706]",
                    badgeBg: "bg-[#fef3c7] text-[#d97706]",
                    dot: "bg-[#f59e0b]",
                  };
                }
              } else if (item.type === "LESSON_MATERIAL") {
                if (item.subtype === "VIDEO") {
                  Icon = Video;
                  badgeLabel = "";
                  styles = {
                    unreadRowBg: "bg-[#f0f9ff]/50 hover:bg-[#f0f9ff]/80",
                    iconBg: "bg-[#e0f2fe] text-[#0284c7]",
                    badgeBg: "bg-[#e0f2fe] text-[#0284c7]",
                    dot: "bg-[#0284c7]",
                  };
                } else if (item.subtype === "PDF") {
                  Icon = FileDown;
                  badgeLabel = "";
                  styles = {
                    unreadRowBg: "bg-[#f8fafc]/60 hover:bg-[#f1f5f9]/60",
                    iconBg: "bg-[#e2e8f0] text-[#475569]",
                    badgeBg: "bg-[#e2e8f0] text-[#475569]",
                    dot: "bg-[#64748b]",
                  };
                } else {
                  Icon = BookOpen;
                  badgeLabel = "";
                  styles = {
                    unreadRowBg: "bg-[#f8fafc]/60 hover:bg-[#f1f5f9]/60",
                    iconBg: "bg-[#e2e8f0] text-[#475569]",
                    badgeBg: "bg-[#e2e8f0] text-[#475569]",
                    dot: "bg-[#64748b]",
                  };
                }
                } else if (item.type === "ANNOUNCEMENT") {
                Icon = Megaphone;
                badgeLabel = "THÔNG BÁO";
                styles = {
                  unreadRowBg: "bg-rose-50/60 hover:bg-rose-50/90",
                  iconBg: "bg-rose-100 text-rose-600",
                  badgeBg: "bg-rose-100 text-rose-700",
                  dot: "bg-rose-500",
                };
              }

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    if (item.type === "ANNOUNCEMENT") {
                      void queryClient.invalidateQueries({
                        queryKey: ["announcement"],
                      });
                    }
                    if (!item.is_read) {
                      void feed
                        .markAsRead(item.id)
                        .catch(() =>
                          toast.error("Chưa lưu được trạng thái đã đọc.")
                        );
                    }
                    setOpen(false);
                    router.push(notificationLink(item));
                  }}
                  className={`flex w-full items-start gap-3.5 px-6 py-4 text-left transition-colors ${
                    !item.is_read
                      ? `${styles.unreadRowBg}`
                      : "bg-white hover:bg-slate-50/70"
                  }`}
                >
                  {/* Khối Icon dạng squircle */}
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-[14px] ${styles.iconBg}`}
                  >
                    <Icon className="size-4.5 stroke-[2.2]" />
                  </div>

                  {/* Nội dung thông báo */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate text-[13.5px] tracking-tight leading-snug ${
                          !item.is_read
                            ? "font-black text-slate-900"
                            : "font-bold text-slate-700"
                        }`}
                      >
                        {item.title}
                      </span>

                      {badgeLabel && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase shrink-0 ${styles.badgeBg}`}
                        >
                          {badgeLabel}
                        </span>
                      )}
                    </div>

                    {item.content?.trim() && (
                      <p
                        className={`line-clamp-2 text-xs leading-relaxed ${
                          !item.is_read
                            ? "font-medium text-slate-600"
                            : "font-normal text-slate-400"
                        }`}
                      >
                        {item.content}
                      </p>
                    )}

                    <time
                      dateTime={item.created_at}
                      className="block text-[11px] font-semibold text-slate-400 mt-1"
                    >
                      {relativeTime(item.created_at)}
                    </time>
                  </div>

                  {/* Chấm tròn chưa đọc ở góc phải */}
                  {!item.is_read && (
                    <span
                      aria-label="Chưa đọc"
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${styles.dot}`}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer
        <div className="border-t border-slate-100 bg-[#fbfcfd] px-4 py-3.5 text-center">
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#64748b]">
            XEM 20 THÔNG BÁO GẦN NHẤT
          </span>
        </div> */}
      </PopoverContent>
    </Popover>
  );
}