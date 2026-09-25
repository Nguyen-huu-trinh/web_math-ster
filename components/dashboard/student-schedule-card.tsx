"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
} from "lucide-react";
import { useStudentSchedule } from "@/hooks/use-student-schedule";
import { useAuth } from "@/providers/auth-provider";

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
  const [year, month, day] = dateString.split("-").map(Number);
  if (!day || !month) return dateString;
  return `${day}/${month}`;
}

function formatTime(time: string) {
  return time ? time.slice(0, 5) : "";
}

const DAYS = [
  { id: "mon", key: 1, label: "Thứ 2", slot: "all" },
  { id: "tue", key: 2, label: "Thứ 3", slot: "all" },
  { id: "wed", key: 3, label: "Thứ 4", slot: "all" },
  { id: "thu", key: 4, label: "Thứ 5", slot: "all" },
  { id: "fri", key: 5, label: "Thứ 6", slot: "all" },
  { id: "sat", key: 6, label: "Thứ 7", slot: "all" },
  { id: "sun-morning", key: 0, label: "Sáng CN", slot: "morning" },
  { id: "sun-evening", key: 0, label: "Tối CN", slot: "evening" },
] as const;

export function StudentScheduleCard() {
  const [weekType, setWeekType] = useState<WeekType>("current");
  
  // Tính ngày hôm nay & ngày mai
  const now = new Date();
  const today = formatDate(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDate(tomorrowDate);

  const { profile } = useAuth();
  const week = useMemo(() => getWeekRange(weekType), [weekType]);
  const scheduleQuery = useStudentSchedule(week.startDate, week.endDate);
  const schedules = scheduleQuery.data ?? [];

  const flatSchedules = useMemo(() => {
    return DAYS.flatMap((day) => {
      const items = schedules.filter((item) => {
        const date = new Date(`${item.session_date}T00:00:00`);
        if (date.getDay() !== day.key) return false;

        if (day.slot === "morning") return item.start_time < "12:00";
        if (day.slot === "evening") return item.start_time >= "12:00";

        return true;
      });

      items.sort((a, b) => a.start_time.localeCompare(b.start_time));

      return items.map((item) => ({
        ...item,
        dayLabel: day.label,
      }));
    });
  }, [schedules]);

  return (
    <div className="w-full bg-white text-slate-800 p-1 sm:p-2">
      {/* Header */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600">
              <Calendar className="size-4.5 stroke-[2.5]" />
            </span>
            Thời khóa biểu học tập
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock className="size-3.5" />
            Tuần từ {formatDisplayDate(week.startDate)} – {formatDisplayDate(week.endDate)}/
            {new Date(week.startDate).getFullYear()}
          </p>
        </div>

        {/* Tab tuần */}
        <div className="inline-flex self-start sm:self-auto rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setWeekType("current")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              weekType === "current"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tuần hiện tại
          </button>
          <button
            type="button"
            onClick={() => setWeekType("next")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              weekType === "next"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tuần sau
          </button>
        </div>
      </div>

      {/* Loading / Error / Empty States */}
      {scheduleQuery.isLoading && (

        <div className="mt-6 rounded-xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          Đang húc . . . 

        </div>
      )}

      {scheduleQuery.isError && (
        <div className="py-16 text-center text-sm font-semibold text-rose-500">
          Không thể tải thời khóa biểu. Vui lòng thử lại.
        </div>
      )}

      {!scheduleQuery.isLoading && !scheduleQuery.isError && flatSchedules.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-base font-bold text-slate-700">Chưa có lịch học</p>
          <p className="mt-1 text-xs text-slate-400">
            {weekType === "current"
              ? "Hiện chưa có lịch học nào cho tuần này."
              : "Tuần sau chưa có lịch học nào."}
          </p>
        </div>
      )}

      {/* Danh sách các buổi học dạng Card */}
      {!scheduleQuery.isLoading && !scheduleQuery.isError && flatSchedules.length > 0 && (
        <div className="mt-5 space-y-3">
          {flatSchedules.map((item) => {
            const isToday = item.session_date === today;
            const isTomorrow = item.session_date === tomorrow;
            const isPast = item.session_date < today;

            const isMorning = item.start_time < "12:00";
            const timePeriod = isMorning ? "Sáng" : "Tối";
            const timeDisplay = `${formatTime(item.start_time)} ${isToday ? `${timePeriod} nay` : timePeriod}`;

            return (
              <div
                key={item.id}
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[22px] border p-4 transition-all ${
                  isToday
                    ? "border-amber-300/80 bg-amber-50/20 shadow-xs"
                    : "border-slate-150 bg-white hover:border-slate-200"
                }`}
              >
                {/* Khối bên trái: Thứ/Ngày + Nội dung */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Cột Thứ & Ngày */}
                  <div className="w-16 shrink-0 text-center flex flex-col items-center justify-center">
                    {isToday ? (
                      /* Design chuẩn theo ảnh mẫu */
                      <div className="flex flex-col items-center">
                        <span className="text-[17px] font-black tracking-tight text-[#843e00] leading-none mb-1">
                          {item.dayLabel}
                        </span>
                        <div className="w-[58px] py-1 rounded-[16px] bg-[#f59e0b] text-white flex flex-col items-center justify-center shadow-xs">
                          <span className="text-[10px] font-black leading-tight tracking-wider">HÔM</span>
                          <span className="text-[10px] font-black leading-tight tracking-wider">NAY</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[14px] font-black text-slate-800">
                          {item.dayLabel}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          {formatDisplayDate(item.session_date)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Vạch ngăn đứng màu vàng cam ở thẻ Hôm Nay */}
                  {isToday && (
                    <div className="hidden sm:block h-10 w-[3px] rounded-full bg-[#fcd34d] shrink-0" />
                  )}

                  {/* Nội dung buổi học */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`break-words text-sm sm:text-[14.5px] font-black tracking-tight leading-snug ${
                          isToday ? "text-slate-950" : "text-slate-800"
                        }`}
                      >
                        {item.content}
                      </h3>

                      {item.note && (
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${
                            item.note.includes("Bài giảng")
                              ? "border-sky-200 bg-sky-50 text-sky-600"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {item.note}
                        </span>
                      )}
                    </div>

                    {/* Giờ + Lưu ý */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="size-3.5" />
                        {timeDisplay}
                      </span>

                      {item.reminder && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            ⚠️ {item.reminder}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Khối bên phải: Nút Vào lớp học / Trạng thái */}
                <div className="flex items-center justify-end shrink-0 sm:pl-2">
                  {isToday ? (
                    profile?.link_zoom ? (
                      <a
                        href={profile.link_zoom}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#ea580c] hover:bg-[#d94e08] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
                      >
                        <Video className="size-4 stroke-[2.5]" />
                        <span>Vào lớp học</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center rounded-xl bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-800">
                        Hôm nay
                      </span>
                    )
                  ) : isPast ? (
                    <span className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-400">
                      Đã kết thúc
                    </span>
                  ) : isTomorrow ? (
                    <span className="text-xs font-bold text-slate-400">
                      Ngày mai
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
