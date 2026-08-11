import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";

import {
    teacherStudentClientService,
} from "@/services/teacher-student-client.service";

export function useEnableTeacherStudent() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            studentId: string
        ) =>
            teacherStudentClientService.enable(
                studentId
            ),

        onSuccess: (
            _data,
            studentId
        ) => {
            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.teacherStudents.all(),
            });

            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.teacherStudents.detail(
                        studentId
                    ),
            });
        },
    });
}