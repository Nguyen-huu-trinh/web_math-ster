import { useQuery } from "@tanstack/react-query";

import {
  examAttemptsClientService,
} from "@/services/exam-attempts-client.service";

export function useExamAttempts(
  examId: string
) {
  return useQuery({
    queryKey: [
      "exam-attempts",
      examId,
    ],

    queryFn: () =>
      examAttemptsClientService.getByExam(
        examId
      ),

    enabled: !!examId,
  });
}