import { useQuery } from "@tanstack/react-query";

import { attemptAnswerClientService } from "@/services/attempt-answer-client.service";

export function useAttemptAnswers(
  attemptId: string
) {

  return useQuery({

    queryKey: [
      "attempt-answers",
      attemptId,
    ],

    queryFn: () =>
      attemptAnswerClientService.getAnswers(
        attemptId
      ),

  });

}