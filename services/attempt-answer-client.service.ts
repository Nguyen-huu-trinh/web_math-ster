import { apiClient } from "@/lib/api/client";

export interface ExamAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer: string[];
}

class AttemptAnswerClientService {

  getAnswers(
    attemptId: string
  ) {
    return apiClient.get<ExamAnswer[]>(
      `/api/students/attempts/${attemptId}/answers`
    );
  }

  saveAnswer(
    attemptId: string,
    questionId: string,
    answer: string[]
  ) {
    return apiClient.post(
      `/api/students/attempts/${attemptId}/answers`,
      {
        questionId,
        answer,
      }
    );
  }

}

export const attemptAnswerClientService =
  new AttemptAnswerClientService();