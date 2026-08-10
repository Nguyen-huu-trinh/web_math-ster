import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";
import { teacherStudentClientService } from "@/services/teacher-student-client.service";

export function useUpdateTeacherStudent(
    studentId: string
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            values: {
                personalEmail?: string | null;
                points?: number;
                rewardMoney?: number;
            }
        ) =>
            teacherStudentClientService.update(
                studentId,
                values
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