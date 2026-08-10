import { apiClient } from "@/lib/api/client";

export interface CreateAttendanceResult {
    success: boolean;
    message: string;
    studentCount: number;
}

class AttendanceTeacherClientService {
    async process(code: string) {
        return apiClient.post<CreateAttendanceResult>(
            "/api/teachers/attendance/create",
            {
                code,
            }
        );
    }
}

export const attendanceTeacherClientService =
    new AttendanceTeacherClientService();