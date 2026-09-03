import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teacherStudentClientService } from "@/services/teacher-student-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useAddTeacherCourseStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            courseId,
            studentIds,
        }: {
            courseId: string;
            studentIds: string[];
        }) =>
            teacherStudentClientService.addToCourse(
                courseId,
                studentIds
            ),

        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({
                queryKey:
                    queryKeys.teacherStudents.byCourse(
                        variables.courseId
                    ),
            });
        },
    });
}