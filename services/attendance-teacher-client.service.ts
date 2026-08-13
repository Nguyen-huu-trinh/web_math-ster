import { apiClient } from "@/lib/api/client";

export interface CreateAttendanceResult {
    success: boolean;
    message: string;
    studentCount: number;
}
export interface CurrentAttendanceResult {
    success: boolean;
    data: {
        code: string;
    } | null;
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
    async getCurrent() {
    return apiClient.get<CurrentAttendanceResult>(
        "/api/teachers/attendance/current"
    );
}
}

export const attendanceTeacherClientService =
    new AttendanceTeacherClientService();