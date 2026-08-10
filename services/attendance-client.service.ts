import { apiClient } from "@/lib/api/client";

export interface SubmitAttendanceResult {
    success: boolean;
    message: string;
    pointsAdded: number;
}

class AttendanceClientService {
    async submit(code: string) {
        return apiClient.post<SubmitAttendanceResult>(
            "/api/students/attendance",
            {
                code,
            }
        );
    }
}

export const attendanceClientService =
    new AttendanceClientService();