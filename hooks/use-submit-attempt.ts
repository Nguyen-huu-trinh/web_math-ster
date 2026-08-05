import { useMutation, useQueryClient } from "@tanstack/react-query";

import { attemptSubmitClientService } from "@/services/attempt-submit-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (

      payload: {

        attemptId: string;

        answers: Record<string, any>;

      }

    ) =>

      attemptSubmitClientService.submit(

        payload.attemptId,

        payload.answers

      ),

    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attempt.detail(payload.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attempt.answers(payload.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.myExams(),
      });
    },

  });

}
