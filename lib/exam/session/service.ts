import type {
  ExamSessionRepository,
} from "./repository";

import type {
  ExamSession,
} from "./types";

import {
  examSessionRepository,
} from "./supabase-session-repository";

// ============================================================
// EXAM SESSION SERVICE
// ============================================================

/**
 * Service cho luồng mở / resume bài thi.
 *
 * Service không tự query Supabase.
 * Service không chứa React.
 * Service không chứa UI.
 *
 * Nhiệm vụ:
 * - gọi repository
 * - giữ cho tầng page không phụ thuộc trực tiếp
 *   vào implementation của database
 */
export class ExamSessionService {
  private readonly repository: ExamSessionRepository;

  constructor(
    repository: ExamSessionRepository
  ) {
    this.repository =
      repository;
  }

  // ==========================================================
  // STUDENT
  // ==========================================================

  /**
   * Lấy session bài thi của học sinh.
   *
   * Bao gồm:
   * - attempt
   * - exam
   * - PDF
   * - savedAnswers
   * - remainingSeconds
   * - expiresAt
   */
  async getStudentExamSession(
    studentId: string,
    attemptId: string
  ): Promise<ExamSession> {
    const session =
      await this.repository
        .getStudentExamSession(
          studentId,
          attemptId
        );

    if (!session) {
      throw new Error(
        "Không tìm thấy bài thi."
      );
    }

    return session;
  }

  // ==========================================================
  // TEACHER
  // ==========================================================

  /**
   * Lấy session để giáo viên xem lại bài.
   */
  async getTeacherExamSession(
    attemptId: string
  ): Promise<ExamSession> {
    const session =
      await this.repository
        .getTeacherExamSession(
          attemptId
        );

    if (!session) {
      throw new Error(
        "Không tìm thấy bài thi."
      );
    }

    return session;
  }
}

// ============================================================
// SINGLETON
// ============================================================

export const examSessionService =
  new ExamSessionService(
    examSessionRepository
  );