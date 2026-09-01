import type {
  ExamAnswers,
} from "../types";

import type {
  GradingResult,
} from "../grading/types";

import type {
  SubmitReason,
  SubmitEngineResult,
} from "./types";

// ============================================================
// PUBLIC SUBMIT RESULT
// ============================================================

export interface PublicSubmitResult {
  success: true;

  attemptId: string;

  score: number;

  passed: boolean;

  alreadySubmitted: boolean;

  reason: SubmitReason;

  answers: ExamAnswers;
}

// ============================================================
// BUILD RESULT
// ============================================================

/**
 * Chuyển kết quả nội bộ của Submit Engine
 * thành response dành cho frontend.
 *
 * Layer này không trả nguyên database record.
 */
export function buildSubmitResult(
  result: SubmitEngineResult,
  reason: SubmitReason,
  answers: ExamAnswers
): PublicSubmitResult | null {
  if (
    !result.success ||
    !result.attempt ||
    !result.grading
  ) {
    return null;
  }

  return {
    success: true,

    attemptId:
      result.attempt.id,

    score:
      result.grading.score,

    passed:
      result.grading.passed,

    alreadySubmitted:
      result.alreadySubmitted,

    reason,

    answers,
  };
}