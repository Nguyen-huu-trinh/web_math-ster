// "use client";

// import { useMemo, useState } from "react";
// import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
// import { useStudentSchedule } from "@/hooks/use-student-schedule";

// type WeekType = "current" | "next";

// function formatDate(date: Date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// }

// function getMonday(date: Date) {
//   const result = new Date(date);
//   result.setHours(0, 0, 0, 0);

//   const day = result.getDay();

//   // Chủ nhật = 0 → lùi 6 ngày
//   // Thứ 2 = 1 → lùi 0 ngày
//   const diff = day === 0 ? -6 : 1 - day;

//   result.setDate(result.getDate() + diff);

//   return result;
// }

// function getWeekRange(weekType: WeekType) {
//   const today = new Date();

//   const monday = getMonday(today);

//   if (weekType === "next") {
//     monday.setDate(monday.getDate() + 7);
//   }

//   const sunday = new Date(monday);
//   sunday.setDate(sunday.getDate() + 6);

//   return {
//     startDate: formatDate(monday),
//     endDate: formatDate(sunday),
//     monday,
//     sunday,
//   };
// }

// function formatDisplayDate(dateString: string) {
//   const date = new Date(`${dateString}T00:00:00`);

//   return new Intl.DateTimeFormat("vi-VN", {
//     weekday: "short",
//     day: "2-digit",
//     month: "2-digit",
//   }).format(date);
// }

// function formatTime(time: string) {
//   return time.slice(0, 5);
// }

// const DAYS = [
//   {
//     key: 1,
//     label: "Thứ 2",
//   },
//   {
//     key: 2,
//     label: "Thứ 3",
//   },
//   {
//     key: 3,
//     label: "Thứ 4",
//   },
//   {
//     key: 4,
//     label: "Thứ 5",
//   },
//   {
//     key: 5,
//     label: "Thứ 6",
//   },
//   {
//     key: 6,
//     label: "Thứ 7",
//   },
//   {
//     key: 0,
//     label: "Chủ nhật",
//   },
// ];

// export function StudentScheduleCard() {
//   const [weekType, setWeekType] =
//     useState<WeekType>("current");

//   const week = useMemo(
//     () => getWeekRange(weekType),
//     [weekType]
//   );

//   const scheduleQuery = useStudentSchedule(
//     week.startDate,
//     week.endDate
//   );

//   const schedules = scheduleQuery.data ?? [];

//   const schedulesByDay = useMemo(() => {
//     const result: Record<
//       number,
//       typeof schedules
//     > = {
//       0: [],
//       1: [],
//       2: [],
//       3: [],
//       4: [],
//       5: [],
//       6: [],
//     };

//     for (const item of schedules) {
//       const date = new Date(
//         `${item.session_date}T00:00:00`
//       );

//       result[date.getDay()].push(item);
//     }

//     return result;
//   }, [schedules]);

//   return (
//     <div className="rounded-xl border bg-card p-5 shadow-sm">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h2 className="text-lg font-semibold">
//             Thời khóa biểu
//           </h2>

//           <p className="text-sm text-muted-foreground">
//             {formatDisplayDate(week.startDate)} -{" "}
//             {formatDisplayDate(week.endDate)}
//           </p>
//         </div>

//         <div className="flex items-center gap-1 rounded-lg border p-1">
//           <button
//             type="button"
//             onClick={() => setWeekType("current")}
//             className={`rounded-md px-3 py-1.5 text-sm transition ${
//               weekType === "current"
//                 ? "bg-primary text-primary-foreground"
//                 : "hover:bg-muted"
//             }`}
//           >
//             Tuần hiện tại
//           </button>

//           <button
//             type="button"
//             onClick={() => setWeekType("next")}
//             className={`rounded-md px-3 py-1.5 text-sm transition ${
//               weekType === "next"
//                 ? "bg-primary text-primary-foreground"
//                 : "hover:bg-muted"
//             }`}
//           >
//             Tuần sau
//           </button>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="mt-4 flex items-center justify-between">
//         <button
//           type="button"
//           onClick={() => setWeekType("current")}
//           disabled={weekType === "current"}
//           className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
//         >
//           <ChevronLeft className="h-4 w-4" />
//           Tuần hiện tại
//         </button>

//         <span className="text-sm font-medium">
//           {weekType === "current"
//             ? "Tuần hiện tại"
//             : "Tuần sau"}
//         </span>

//         <button
//           type="button"
//           onClick={() => setWeekType("next")}
//           disabled={weekType === "next"}
//           className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
//         >
//           Tuần sau
//           <ChevronRight className="h-4 w-4" />
//         </button>
//       </div>

//       {/* Loading */}
//       {scheduleQuery.isLoading && (
//         <div className="mt-6 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
//           Đang tải thời khóa biểu...
//         </div>
//       )}

//       {/* Error */}
//       {scheduleQuery.isError && (
//         <div className="mt-6 rounded-lg border border-dashed py-10 text-center text-sm text-destructive">
//           Không thể tải thời khóa biểu.
//         </div>
//       )}

//       {/* Empty */}
//       {!scheduleQuery.isLoading &&
//         !scheduleQuery.isError &&
//         schedules.length === 0 && (
//           <div className="mt-6 rounded-lg border border-dashed py-10 text-center">
//             <p className="text-sm font-medium">
//               Chưa có lịch học
//             </p>

//             <p className="mt-1 text-xs text-muted-foreground">
//               {weekType === "current"
//                 ? "Hiện chưa có lịch học cho tuần này."
//                 : "Tuần sau chưa có lịch học."}
//             </p>
//           </div>
//         )}

//       {/* Schedule */}
//       {!scheduleQuery.isLoading &&
//         !scheduleQuery.isError &&
//         schedules.length > 0 && (
//           <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
//             {DAYS.map((day) => {
//               const items = schedulesByDay[day.key];

//               return (
//                 <div
//                   key={day.key}
//                   className="rounded-lg border bg-muted/20"
//                 >
//                   <div className="border-b px-3 py-2">
//                     <p className="text-sm font-semibold">
//                       {day.label}
//                     </p>
//                   </div>

//                   <div className="space-y-2 p-2">
//                     {items.length === 0 ? (
//                       <p className="px-2 py-4 text-center text-xs text-muted-foreground">
//                         Không có lịch
//                       </p>
//                     ) : (
//                       items.map((item) => (
//                         <div
//                           key={item.id}
//                           className="rounded-md border bg-card p-3"
//                         >
//                           <div className="flex items-start gap-2">
//                             <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

//                             <div className="min-w-0 flex-1">
//                               <p className="text-xs font-medium text-muted-foreground">
//                                 {formatTime(
//                                   item.start_time
//                                 )}
//                               </p>

//                               <p className="mt-1 text-sm font-semibold">
//                                 {item.content}
//                               </p>

//                               {item.note && (
//                                 <p className="mt-1 text-xs text-muted-foreground">
//                                   {item.note}
//                                 </p>
//                               )}

//                               {item.reminder && (
//                                 <p className="mt-2 text-xs font-medium text-primary">
//                                   {item.reminder}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//     </div>
//   );
// }



"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, AlertCircle, FileText, Calendar } from "lucide-react";
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
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
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

export function StudentScheduleCard() {
  const [weekType, setWeekType] = useState<WeekType>("current");

  const week = useMemo(() => getWeekRange(weekType), [weekType]);

  const scheduleQuery = useStudentSchedule(week.startDate, week.endDate);
  const schedules = scheduleQuery.data ?? [];

  // Lấy dữ liệu và sắp xếp theo thứ tự các ngày trong tuần
  const flatSchedules = useMemo(() => {
    return DAYS.flatMap((day) => {
      const items = schedules.filter((item) => {
        const date = new Date(`${item.session_date}T00:00:00`);
        return date.getDay() === day.key;
      });

      // Sắp xếp các tiết học trong cùng 1 ngày theo giờ bắt đầu
      items.sort((a, b) => (a.start_time > b.start_time ? 1 : -1));

      return items.map((item) => ({
        ...item,
        dayLabel: day.label,
      }));
    });
  }, [schedules]);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Thời khóa biểu</h2>
          <p className="text-sm text-muted-foreground">
            {formatDisplayDate(week.startDate)} - {formatDisplayDate(week.endDate)}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setWeekType("current")}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              weekType === "current"
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted"
            }`}
          >
            Tuần hiện tại
          </button>

          <button
            type="button"
            onClick={() => setWeekType("next")}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              weekType === "next"
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted"
            }`}
          >
            Tuần sau
          </button>
        </div>
      </div>

      {/* Navigation */}
      {/* <div className="mt-4 flex items-center justify-between border-b pb-4">
        <button
          type="button"
          onClick={() => setWeekType("current")}
          disabled={weekType === "current"}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Tuần hiện tại
        </button>

        <span className="text-sm font-semibold">
          {weekType === "current" ? "Tuần hiện tại" : "Tuần sau"}
        </span>

        <button
          type="button"
          onClick={() => setWeekType("next")}
          disabled={weekType === "next"}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          Tuần sau
          <ChevronRight className="h-4 w-4" />
        </button>
      </div> */}

      {/* Loading State */}
      {scheduleQuery.isLoading && (
        <div className="mt-6 rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          Đang tải thời khóa biểu...
        </div>
      )}

      {/* Error State */}
      {scheduleQuery.isError && (
        <div className="mt-6 rounded-lg border border-dashed py-12 text-center text-sm text-destructive">
          Không thể tải thời khóa biểu.
        </div>
      )}

      {/* Empty State */}
      {!scheduleQuery.isLoading &&
        !scheduleQuery.isError &&
        flatSchedules.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm font-medium">Chưa có lịch học</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {weekType === "current"
                ? "Hiện chưa có lịch học cho tuần này."
                : "Tuần sau chưa có lịch học."}
            </p>
          </div>
        )}

      {/* Schedule Table */}
      {!scheduleQuery.isLoading &&
        !scheduleQuery.isError &&
        flatSchedules.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="px-4 py-3 whitespace-nowrap">Thứ / Ngày</th>
                  <th className="px-4 py-3 whitespace-nowrap">Giờ vào lớp</th>
                  <th className="px-4 py-3 min-w-[200px]">Nội dung buổi học</th>
                  <th className="px-4 py-3 min-w-[180px]">Ghi chú</th>
                  <th className="px-4 py-3 min-w-[180px]">Lưu ý</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {flatSchedules.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {/* Ngày Thứ */}
                    <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <span>{item.dayLabel}</span>
                          <span className="block text-xs text-muted-foreground font-normal">
                            {formatDisplayDate(item.session_date)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Giờ vào lớp */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(item.start_time)}
                      </div>
                    </td>

                    {/* Nội dung buổi học */}
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {item.content}
                    </td>

                    {/* Ghi chú */}
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {item.note ? (
                        <div className="flex items-start gap-1">
                          <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{item.note}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </td>

                    {/* Lưu ý */}
                    <td className="px-4 py-3.5 text-xs font-medium text-amber-600 dark:text-amber-500">
                      {item.reminder ? (
                        <div className="flex items-start gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{item.reminder}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 font-normal">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}