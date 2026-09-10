"use client";

import { useMemo, useState } from "react";
import { Clock, AlertCircle, FileText, Calendar, BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import { useStudentSchedule } from "@/hooks/use-student-schedule";

type WeekType = "current" | "next";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonday(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);

  return result;
}

function getWeekRange(weekType: WeekType) {
  const today = new Date();
  const monday = getMonday(today);

  if (weekType === "next") {
    monday.setDate(monday.getDate() + 7);
  }

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
    monday,
    sunday,
  };
}

function formatDisplayDate(dateString: string) {
  // Tách trực tiếp chuỗi "YYYY-MM-DD" để tránh lỗi lệch múi giờ (timezone offset)
  const [year, month, day] = dateString.split("-").map(Number);
  
  if (!day || !month) return dateString;

  return `${day}/${month}`;
}

function formatTime(time: string) {
  return time ? time.slice(0, 5) : "";
}

const DAYS = [
  { key: 1, label: "Thứ 2" },
  { key: 2, label: "Thứ 3" },
  { key: 3, label: "Thứ 4" },
  { key: 4, label: "Thứ 5" },
  { key: 5, label: "Thứ 6" },
  { key: 6, label: "Thứ 7" },
  { key: 0, label: "Chủ nhật" },
];

// Helper hiển thị Badge cho trường Ghi chú
function NoteBadge({ note }: { note: string | null | undefined }) {
  if (!note) return <span className="text-muted-foreground/30 font-normal">-</span>;

  let badgeStyle = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
  let Icon = FileText;

  if (note.includes("Bài giảng")) {
    badgeStyle = "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    Icon = BookOpen;
  } else if (note.includes("Chữa bài")) {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    Icon = CheckCircle2;
  } else if (note.includes("Chữa đề")) {
    badgeStyle = "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    Icon = GraduationCap;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{note}</span>
    </span>
  );
}

export function StudentScheduleCard() {
  const [weekType, setWeekType] = useState<WeekType>("current");

  const week = useMemo(() => getWeekRange(weekType), [weekType]);

  const scheduleQuery = useStudentSchedule(week.startDate, week.endDate);
  const schedules = scheduleQuery.data ?? [];

  // Sắp xếp các buổi học theo từng ngày trong tuần
  const flatSchedules = useMemo(() => {
    return DAYS.flatMap((day) => {
      const items = schedules.filter((item) => {
        const date = new Date(`${item.session_date}T00:00:00`);
        return date.getDay() === day.key;
      });

      items.sort((a, b) => (a.start_time > b.start_time ? 1 : -1));

      return items.map((item) => ({
        ...item,
        dayLabel: day.label,
      }));
    });
  }, [schedules]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Thời khóa biểu</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            {formatDisplayDate(week.startDate)} – {formatDisplayDate(week.endDate)}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1.5">
          <button
            type="button"
            onClick={() => setWeekType("current")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              weekType === "current"
                ? "bg-amber-400 text-amber-950 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Tuần hiện tại
          </button>

          <button
            type="button"
            onClick={() => setWeekType("next")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              weekType === "next"
                ? "bg-amber-400 text-amber-950 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Tuần sau
          </button>
        </div>
      </div>

      {/* Loading State */}
      {scheduleQuery.isLoading && (
        <div className="mt-6 rounded-xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          Đang tải thời khóa biểu...
        </div>
      )}

      {/* Error State */}
      {scheduleQuery.isError && (
        <div className="mt-6 rounded-xl border border-dashed py-14 text-center text-sm text-destructive">
          Không thể tải thời khóa biểu.
        </div>
      )}

      {/* Empty State */}
      {!scheduleQuery.isLoading &&
        !scheduleQuery.isError &&
        flatSchedules.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed py-14 text-center">
            <p className="text-base font-semibold">Chưa có lịch học</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {weekType === "current"
                ? "Hiện chưa có lịch học nào cho tuần này."
                : "Tuần sau chưa có lịch học nào."}
            </p>
          </div>
        )}

      {/* Schedule Table */}
      {!scheduleQuery.isLoading &&
        !scheduleQuery.isError &&
        flatSchedules.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl border bg-background shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                    <th className="w-[140px] px-5 py-3.5 whitespace-nowrap">Thứ / Ngày</th>
                    <th className="w-[120px] px-5 py-3.5 whitespace-nowrap">Giờ vào lớp</th>
                    <th className="px-5 py-3.5 min-w-[220px]">Nội dung buổi học</th>
                    <th className="w-[150px] px-5 py-3.5 whitespace-nowrap">Ghi chú</th>
                    <th className="w-[220px] px-5 py-3.5 min-w-[200px]">Lưu ý</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {flatSchedules.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      {/* Thứ / Ngày */}
                      <td className="px-5 py-4 align-top font-medium whitespace-nowrap">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">{item.dayLabel}</span>
                            <span className="block text-xs text-muted-foreground font-normal">
                              {formatDisplayDate(item.session_date)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Giờ vào lớp */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(item.start_time)}
                        </span>
                      </td>

                      {/* Nội dung buổi học */}
                      <td className="px-5 py-4 align-top font-semibold text-foreground leading-relaxed">
                        {item.content}
                      </td>

                      {/* Ghi chú */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        <NoteBadge note={item.note} />
                      </td>

                      {/* Lưu ý */}
                      <td className="px-5 py-4 align-top">
                        {item.reminder ? (
                          <div className="inline-flex items-start gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-900/50 p-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <span className="leading-tight">{item.reminder}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 font-normal">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}