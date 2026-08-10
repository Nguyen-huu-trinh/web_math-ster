import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { attendanceClientService } from "@/services/attendance-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useSubmitAttendance() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (code: string) =>
            attendanceClientService.submit(code),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey:
                    queryKeys.dashboard.student,
            });
        },
    });
}