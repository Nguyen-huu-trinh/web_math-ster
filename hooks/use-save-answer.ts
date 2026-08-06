import { useMutation } from "@tanstack/react-query";

import {
  attemptAnswerClientService,
  ExamAnswers,
} from "@/services/attempt-answer-client.service";

export function useSaveAnswer() {
  return useMutation({

    mutationFn: (
      payload: {
        attemptId: string;
        answers: ExamAnswers;
      }
    ) =>
      attemptAnswerClientService.saveAnswer(
        payload.attemptId,
        payload.answers
      ),

  });
}