import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";
import { teacherStudentClientService } from "@/services/teacher-student-client.service";

export function useTeacherStudentDetail(
    studentId: string
) {
    return useQuery({
        queryKey:
            queryKeys.teacherStudents.detail(
                studentId
            ),

        queryFn: () =>
            teacherStudentClientService.getById(
                studentId
            ),

        enabled: !!studentId,
    });
}