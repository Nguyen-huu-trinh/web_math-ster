import { apiClient } from "@/lib/api/client";

export interface ProcessAttendanceResult {
    success: boolean;
    message: string;
    correctCount: number;
    totalStudents: number;
}

class AttendanceTeacherClientService {

    async process(
        correctCode: string
    ) {
        return apiClient.post<ProcessAttendanceResult>(
            "/api/teachers/attendance/process",
            {
                correctCode,
            }
        );
    }
}

export const attendanceTeacherClientService =
    new AttendanceTeacherClientService();