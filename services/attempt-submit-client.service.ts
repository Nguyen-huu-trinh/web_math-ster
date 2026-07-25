import { apiClient } from "@/lib/api/client";

export interface SubmitResult {

  score: number;

  passed: boolean;

  showAnswer: boolean;

}

class AttemptSubmitClientService {

  submit(
    attemptId: string,
    answers: Record<string, any>
  ) {

    return apiClient.post<SubmitResult>(
      `/api/students/attempts/${attemptId}/submit`,
      {
        answers,
      }
    );

  }

}

export const attemptSubmitClientService =
  new AttemptSubmitClientService();