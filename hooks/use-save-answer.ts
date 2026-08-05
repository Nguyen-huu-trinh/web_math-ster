import { useMutation, useQueryClient } from "@tanstack/react-query";

import { attemptAnswerClientService } from "@/services/attempt-answer-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useSaveAnswer() {
  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (

      payload: {

        attemptId: string;

        questionId: string;

        answer: string[];

      }

    ) =>

      attemptAnswerClientService.saveAnswer(

        payload.attemptId,

        payload.questionId,

        payload.answer

      ),

    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.attempt.answers(payload.attemptId),
      }),

  });

}
