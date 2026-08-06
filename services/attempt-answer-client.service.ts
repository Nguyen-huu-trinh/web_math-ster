import { apiClient } from "@/lib/api/client";

export interface ExamAnswers {
  multipleChoice: string[];
  trueFalse: string[][];
  shortAnswer: string[][];
}

class AttemptAnswerClientService {

  saveAnswer(
    attemptId: string,
    answers: ExamAnswers
  ) {
    return apiClient.post(
      `/api/students/attempts/${attemptId}/answers`,
      {
        answers,
      }
    );
  }

}

export const attemptAnswerClientService =
  new AttemptAnswerClientService();