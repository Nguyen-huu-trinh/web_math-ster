import { useQuery } from "@tanstack/react-query";

import {
    attendanceTeacherClientService,
} from "@/services/attendance-teacher-client.service";

export function useCurrentAttendance() {
    return useQuery({
        queryKey: ["teacher-current-attendance"],

        queryFn: async () => {
            const result =
                await attendanceTeacherClientService.getCurrent();

            return result.data;
        },
    });
}