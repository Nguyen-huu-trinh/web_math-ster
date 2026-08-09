import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { attendanceClientService } from "@/services/attendance-client.service";

export function useSubmitAttendance() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            code: string
        ) =>
            attendanceClientService.submit(
                code
            ),

        onSuccess: () => {
            // Sau này nếu có query
            // điểm tích lũy thì invalidate
            // tại đây.
        },
    });
}