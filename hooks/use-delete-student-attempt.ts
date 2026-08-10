import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";

import {
    teacherStudentClientService,
} from "@/services/teacher-student-client.service";

export function useDeleteStudentAttempt(
    studentId: string
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            attemptId: string
        ) =>
            teacherStudentClientService.deleteAttempt(
                studentId,
                attemptId
            ),

        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.teacherStudents.detail(
                        studentId
                    ),
            });

            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.teacherStudents.all(),
            });
        },
    });
}