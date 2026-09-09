import { apiClient } from "@/lib/api/client";

export interface StudentSchedule {
  id: string;
  session_date: string;
  content: string;
  start_time: string;
  note: string | null;
  reminder: string | null;
}

interface StudentScheduleResponse {
  success: boolean;
  data: StudentSchedule[];
  message?: string;
}

export const studentScheduleService = {
  async getByWeek(
    startDate: string,
    endDate: string
  ): Promise<StudentSchedule[]> {
    const response = await apiClient.get<StudentScheduleResponse>(
      `/api/student-schedule?startDate=${startDate}&endDate=${endDate}`
    );

    if (!response.success) {
      throw new Error(
        response.message ?? "Không thể tải thời khóa biểu."
      );
    }

    return response.data;
  },
};