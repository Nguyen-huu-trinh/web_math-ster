import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";
import { teacherStudentClientService } from "@/services/teacher-student-client.service";

export function useTeacherCourseStudents(
    courseId: string
) {
    return useQuery({
        queryKey:
            queryKeys.teacherStudents.byCourse(
                courseId
            ),

        queryFn: () =>
            teacherStudentClientService.getByCourse(
                courseId
            ),

        enabled: Boolean(courseId),
    });
}