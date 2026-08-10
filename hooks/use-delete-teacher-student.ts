import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";
import { teacherStudentClientService } from "@/services/teacher-student-client.service";

export function useDeleteTeacherStudent() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            studentId: string
        ) =>
            teacherStudentClientService.delete(
                studentId
            ),

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.teacherStudents.all(),
            });
        },
    });
}