import { useMutation } from "@tanstack/react-query";

import { attemptAnswerClientService } from "@/services/attempt-answer-client.service";

export function useSaveAnswer() {

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

  });

}