import type {
  ExamAttempt,
} from "../types";

import {
  isExamExpired,
} from "../deadline";

import type {
  SubmitExamContext,
  SubmitExamError,
  SubmitExamInput,
} from "./types";

// ============================================================
// ATTEMPT STATE
// ============================================================

export type SubmitAttemptState =
  | "ACTIVE"
  | "EXPIRED"
  | "SUBMITTED";

// ============================================================
// VALIDATION RESULT
// ============================================================

export interface SubmitValidationResult {
  valid: boolean;

  state: SubmitAttemptState;

  error?: SubmitExamError;
}

// ============================================================
// VALIDATE SUBMIT
// ============================================================

/**
 * Xác định trạng thái attempt trước khi submit.
 *
 * Có 3 trạng thái:
 *
 * ACTIVE
 *   → bài vẫn còn thời gian
 *
 * EXPIRED
 *   → hết thời gian nhưng chưa submit
 *
 * SUBMITTED
 *   → attempt đã submit trước đó
 *
 * Hàm này KHÔNG:
 * - gọi database
 * - update database
 * - chấm điểm
 * - thay đổi attempt
 */
export function validateSubmit(
  input: SubmitExamInput,
  context: SubmitExamContext
): SubmitValidationResult {
  // ==========================================================
  // 1. ATTEMPT
  // ==========================================================

  if (!context.attempt) {
    return {
      valid: false,

      state: "ACTIVE",

      error: {
        code:
          "ATTEMPT_NOT_FOUND",

        message:
          "Không tìm thấy lượt làm bài.",
      },
    };
  }

  // ==========================================================
  // 2. OWNERSHIP
  // ==========================================================

  if (
    context.attempt.student_id !==
    input.studentId
  ) {
    return {
      valid: false,

      state: "ACTIVE",

      error: {
        code:
          "UNAUTHORIZED",

        message:
          "Bạn không có quyền nộp lượt làm bài này.",
      },
    };
  }

  // ==========================================================
  // 3. ALREADY SUBMITTED
  // ==========================================================

  if (
    context.attempt.submitted_at
  ) {
    return {
      valid: true,

      state: "SUBMITTED",
    };
  }

  // ==========================================================
  // 4. CHECK DEADLINE
  // ==========================================================

  const durationSeconds =
    context.attempt
      .duration_seconds;

  if (
    durationSeconds === null ||
    durationSeconds === undefined
  ) {
    return {
      valid: false,

      state: "ACTIVE",

      error: {
        code:
          "INVALID_EXAM",

        message:
          "Không xác định được thời gian làm bài.",
      },
    };
  }

  const expired =
    isExamExpired(
      context.attempt.started_at,
      durationSeconds
    );

  // ==========================================================
  // 5. EXPIRED
  // ==========================================================

  if (expired) {
    /**
     * Hết giờ KHÔNG phải lỗi.
     *
     * Đây là một trạng thái hợp lệ để
     * Submit Engine tự động chốt bài.
     */
    return {
      valid: true,

      state: "EXPIRED",
    };
  }

  // ==========================================================
  // 6. ACTIVE
  // ==========================================================

  return {
    valid: true,

    state: "ACTIVE",
  };
}