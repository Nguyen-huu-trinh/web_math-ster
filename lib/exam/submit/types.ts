import type {
  ExamAnswers,
  ExamAttempt,
  ExamAnswerKey,
  ExamQuestionConfig,
  ExamType,
} from "../types";

import type {
  GradingResult,
} from "../grading/types";

// ============================================================
// SUBMIT ENGINE INPUT
// ============================================================

export interface SubmitExamInput {
  /**
   * ID của attempt đang làm.
   */
  attemptId: string;

  /**
   * ID học sinh.
   *
   * Dùng để đảm bảo học sinh chỉ có thể
   * submit attempt của chính mình.
   */
  studentId: string;

  /**
   * Đáp án học sinh gửi lên.
   */
  answers: ExamAnswers;

  /**
   * Lý do submit.
   *
   * Không được dùng reason để quyết định
   * điểm số hoặc quyền submit.
   */
  reason?: SubmitReason;
}

// ============================================================
// SUBMIT REASON
// ============================================================

export type SubmitReason =
  | "manual"
  | "timeout"
  | "fullscreen_exit"
  | "page_exit";

// ============================================================
// SUBMIT CONTEXT
// ============================================================

/**
 * Dữ liệu đã được load từ database
 * trước khi tiến hành grading.
 *
 * Submit Engine chỉ làm nghiệp vụ.
 * Việc query database sẽ nằm ở repository/service.
 */
export interface SubmitExamContext {
  attempt: ExamAttempt;

  answerKey: ExamAnswerKey;

  questionConfig: ExamQuestionConfig;

  examType: ExamType;

  passingScore: number;

  showAnswer: boolean;
}

// ============================================================
// SUBMIT RESULT
// ============================================================

export interface SubmitExamResult {
  /**
   * Attempt sau khi submit.
   */
  attempt: ExamAttempt;

  /**
   * Kết quả chấm điểm.
   */
  grading: GradingResult;

  /**
   * Cho biết request này có thực sự
   * submit attempt hay attempt đã submit trước đó.
   */
  alreadySubmitted: boolean;

  /**
   * Lý do submit.
   */
  reason: SubmitReason;
}

// ============================================================
// SUBMIT STATUS
// ============================================================

export type SubmitStatus =
  | "idle"
  | "submitting"
  | "submitted"
  | "error";

// ============================================================
// SUBMIT ERROR
// ============================================================

export type SubmitErrorCode =
  | "UNAUTHORIZED"
  | "ATTEMPT_NOT_FOUND"
  | "ATTEMPT_ALREADY_SUBMITTED"
  | "ATTEMPT_EXPIRED"
  | "INVALID_ANSWERS"
  | "INVALID_EXAM"
  | "SUBMIT_FAILED";

// ============================================================
// SUBMIT EXCEPTION
// ============================================================

export interface SubmitExamError {
  code: SubmitErrorCode;

  message: string;
}

// ============================================================
// SUBMIT ENGINE RESULT
// ============================================================

/**
 * Kết quả nội bộ của Submit Engine.
 *
 * Tách biệt với HTTP response.
 */
export interface SubmitEngineResult {
  success: boolean;

  attempt: ExamAttempt | null;

  grading: GradingResult | null;

  alreadySubmitted: boolean;

  answers: ExamAnswers | null;

  error?: SubmitExamError;
}