import { apiClient } from "@/lib/api/client";

export interface ExamAttemptStudent {
  id: string;

  student_id: string;

  student_code: string;

  full_name: string;

  attempt_number: number;

  score: number | null;

  is_passed: boolean | null;

  started_at: string | null;

  submitted_at: string | null;

  duration_seconds: number | null;
  class_joined_at: string | null;
}

export interface ExamAttemptsResponse {
  success: boolean;

  data: ExamAttemptStudent[];
}

class ExamAttemptsClientService {

  async getByExam(
    examId: string
  ): Promise<ExamAttemptStudent[]> {

    const response =
      await apiClient.get<ExamAttemptsResponse>(
        `/api/exams/${examId}/answers`
      );

    return response.data ?? [];
  }
}

export const examAttemptsClientService =
  new ExamAttemptsClientService();