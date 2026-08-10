import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-keys";
import { teacherStudentClientService } from "@/services/teacher-student-client.service";

export function useTeacherStudents() {
    return useQuery({
        queryKey:
            queryKeys.teacherStudents.all(),

        queryFn: () =>
            teacherStudentClientService.getAll(),
    });
}