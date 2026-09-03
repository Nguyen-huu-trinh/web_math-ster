import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teacherStudentClientService } from "@/services/teacher-student-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useRemoveTeacherCourseStudent() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            courseId,
            studentId,
        }: {
            courseId: string;
            studentId: string;
        }) =>
            teacherStudentClientService.removeFromCourse(
                courseId,
                studentId
            ),

        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({
                queryKey: [
                    ...queryKeys.teacherStudents.all(),
                    "course",
                    variables.courseId,
                ],
            });
        },
    });
}