import type {
  ExamAnswerKey,
  ExamAttempt,
  ExamQuestionConfig,
  ExamType,
} from "../types";

// ============================================================
// SUBMIT CONTEXT
// ============================================================

/**
 * Dữ liệu cần thiết để xử lý một lần submit.
 *
 * Submit Engine không tự query database.
 * Database layer có trách nhiệm tạo context này.
 */
export interface SubmitContext {
  attempt: ExamAttempt;

  examId: string;

  examType: ExamType;

  category: string;

  passingScore: number;

  questionConfig: ExamQuestionConfig;

  answerKey: ExamAnswerKey;

  showAnswer: boolean;
}

// ============================================================
// CONTEXT LOADER
// ============================================================

export interface SubmitContextRepository {
  /**
   * Load toàn bộ dữ liệu cần thiết cho submit.
   *
   * Nếu attempt không tồn tại hoặc không thuộc
   * studentId thì trả về null.
   */
  getSubmitContext(
    attemptId: string,
    studentId: string
  ): Promise<SubmitContext | null>;
}