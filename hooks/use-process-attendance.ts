import { useMutation } from "@tanstack/react-query";

import {
    attendanceTeacherClientService,
} from "@/services/attendance-teacher-client.service";

export function useProcessAttendance() {

    return useMutation({
        mutationFn: (
            correctCode: string
        ) =>
            attendanceTeacherClientService.process(
                correctCode
            ),
    });

}