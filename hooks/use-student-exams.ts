import { useQuery } from "@tanstack/react-query";

import { studentExamClientService } from "@/services/student-exam-client.service";

export function useStudentExams() {
  return useQuery({
    queryKey: ["student-my-exams"],

    queryFn: () =>
      studentExamClientService.getMyExams(),
  });
}