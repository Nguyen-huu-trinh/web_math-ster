import { useMutation, useQueryClient } from "@tanstack/react-query";

import { studentExamClientService } from "@/services/student-exam-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useStartExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) =>
      studentExamClientService.startExam(
        examId
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.myExams(),
      }),
  });
}
