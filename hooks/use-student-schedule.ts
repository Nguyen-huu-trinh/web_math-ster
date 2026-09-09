"use client";

import { useQuery } from "@tanstack/react-query";
import { studentScheduleService } from "@/services/student-schedule.service";

export const studentScheduleKeys = {
  all: ["student-schedule"] as const,

  week: (startDate: string, endDate: string) =>
    [...studentScheduleKeys.all, "week", startDate, endDate] as const,
};

export function useStudentSchedule(
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: studentScheduleKeys.week(startDate, endDate),

    queryFn: () =>
      studentScheduleService.getByWeek(startDate, endDate),

    enabled: Boolean(startDate && endDate),

    // Không gọi lại Supabase khi dữ liệu vẫn còn mới.
    staleTime: 10 * 60 * 1000,

    // Giữ cache 30 phút sau khi không còn component sử dụng.
    gcTime: 30 * 60 * 1000,

    // Không refetch chỉ vì học sinh chuyển sang tab khác rồi quay lại.
    refetchOnWindowFocus: false,

    // Không tự retry nhiều lần nếu API lỗi.
    retry: 1,
  });
}