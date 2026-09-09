import { apiClient } from "@/lib/api/client";

export interface TeacherSchedule {
  id: string;
  session_date: string;
  content: string;
  start_time: string;
  note: string | null;
  reminder: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TeacherScheduleResponse {
  success: boolean;
  data: TeacherSchedule[];
  message?: string;
}

interface TeacherScheduleSingleResponse {
  success: boolean;
  data: TeacherSchedule;
  message?: string;
}

export interface CreateTeacherScheduleInput {
  session_date: string;
  content: string;
  start_time: string;
  note?: string | null;
  reminder?: string | null;
  is_active?: boolean;
}

export interface UpdateTeacherScheduleInput {
  session_date?: string;
  content?: string;
  start_time?: string;
  note?: string | null;
  reminder?: string | null;
  is_active?: boolean;
}

export const teacherScheduleService = {
  async getByRange(
    startDate: string,
    endDate: string
  ): Promise<TeacherSchedule[]> {
    const response = await apiClient.get<TeacherScheduleResponse>(
      `/api/teacher-schedule?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`
    );

    if (!response.success) {
      throw new Error(
        response.message ?? "Không thể tải thời khóa biểu."
      );
    }

    return response.data ?? [];
  },

  async create(
    input: CreateTeacherScheduleInput
  ): Promise<TeacherSchedule> {
    const response = await apiClient.post<TeacherScheduleSingleResponse>(
      "/api/teacher-schedule",
      input
    );

    if (!response.success) {
      throw new Error(
        response.message ?? "Không thể thêm lịch học."
      );
    }

    return response.data;
  },

  async update(
    id: string,
    input: UpdateTeacherScheduleInput
  ): Promise<TeacherSchedule> {
    const response = await apiClient.patch<TeacherScheduleSingleResponse>(
      `/api/teacher-schedule/${id}`,
      input
    );

    if (!response.success) {
      throw new Error(
        response.message ?? "Không thể cập nhật lịch học."
      );
    }

    return response.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiClient.delete<{
      success: boolean;
      message?: string;
    }>(`/api/teacher-schedule/${id}`);

    if (!response.success) {
      throw new Error(
        response.message ?? "Không thể xóa lịch học."
      );
    }
  },
};