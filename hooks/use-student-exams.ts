import { useQuery } from "@tanstack/react-query";

import { studentExamClientService } from "@/services/student-exam-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useStudentExams() {
  return useQuery({
    queryKey: queryKeys.student.myExams(),

    queryFn: () =>
      studentExamClientService.getMyExams(),
    staleTime: 1000 * 60,
  });
}
