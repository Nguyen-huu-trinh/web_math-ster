import { useMutation } from "@tanstack/react-query";

import { attemptSubmitClientService } from "@/services/attempt-submit-client.service";

export function useSubmitAttempt() {

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

  });

}