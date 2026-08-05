import { useQuery } from "@tanstack/react-query";

import { attemptAnswerClientService } from "@/services/attempt-answer-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useAttemptAnswers(
  attemptId: string
) {

  return useQuery({

    queryKey: queryKeys.attempt.answers(attemptId),
    enabled: Boolean(attemptId),

    queryFn: () =>
      attemptAnswerClientService.getAnswers(
        attemptId
      ),

  });

}
