import type {
  ExamAttempt,
} from "../types";

// ============================================================
// SUBMIT REPOSITORY CONTRACT
// ============================================================

/**
 * Contract cho database layer của submit.
 *
 * File này CHƯA chứa Supabase.
 *
 * Mục đích:
 * - định nghĩa những gì Submit Engine cần database cung cấp;
 * - tách business logic khỏi database implementation.
 */

// ============================================================
// LOAD ATTEMPT
// ============================================================

export interface LoadSubmitAttemptParams {
  attemptId: string;

  studentId: string;
}

export interface SubmitAttemptRepository {
  /**
   * Lấy attempt của đúng học sinh.
   *
   * Repository implementation sẽ đảm bảo:
   *
   * attempt.id === attemptId
   * attempt.student_id === studentId
   */
  getAttempt(
    params: LoadSubmitAttemptParams
  ): Promise<ExamAttempt | null>;

  /**
   * Lưu kết quả submit.
   *
   * Hàm này sẽ được implementation bằng Supabase
   * ở bước tiếp theo.
   */
  submitAttempt(
    params: SaveSubmitAttemptParams
  ): Promise<ExamAttempt | null>;
}

// ============================================================
// SAVE ATTEMPT
// ============================================================

export interface SaveSubmitAttemptParams {
  attemptId: string;

  studentId: string;

  answers: ExamAttempt["answers"];

  score: number;

  isPassed: boolean;

  submittedAt: string;
}