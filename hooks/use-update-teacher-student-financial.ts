import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    teacherStudentClientService,
} from "@/services/teacher-student-client.service";

import {
    queryKeys,
} from "@/lib/react-query/query-keys";

export function useUpdateTeacherStudentFinancial() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            studentId,
            values,
        }: {
            studentId: string;
            values: {
                points?: number;
                rewardMoney?: number;
            };
        }) =>
            teacherStudentClientService
                .updateFinancialInfo(
                    studentId,
                    values
                ),

        onSuccess: (
            _data,
            variables
        ) => {
            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.teacherStudents
                        .all(),
            });

            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.teacherStudents
                        .detail(
                            variables.studentId
                        ),
            });
        },
    });
}