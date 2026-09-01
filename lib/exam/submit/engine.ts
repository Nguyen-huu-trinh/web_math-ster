import {
  gradeExam,
} from "../grading";

import {
  prepareSubmit,
} from "./prepare";

import {
  validateSubmit,
} from "./validate";

import type {
  SubmitExamContext,
  SubmitExamInput,
  SubmitEngineResult,
} from "./types";

// ============================================================
// SUBMIT ENGINE
// ============================================================

/**
 * Xử lý nghiệp vụ submit trước khi ghi database.
 *
 * ACTIVE:
 *   → prepare → validate → grade
 *
 * EXPIRED:
 *   → prepare → validate → grade
 *
 * SUBMITTED:
 *   → không grade lại
 *   → trả trạng thái đã submit
 */
export function processSubmit(
  input: SubmitExamInput,
  context: SubmitExamContext
): SubmitEngineResult {
  // ==========================================================
  // 1. PREPARE
  // ==========================================================

  const prepared =
    prepareSubmit(
      input,
      context.questionConfig
    );

  // ==========================================================
  // 2. VALIDATE / DETERMINE STATE
  // ==========================================================

  const validation =
    validateSubmit(
      {
        ...input,

        answers:
          prepared.answers,
      },
      context
    );

  // ==========================================================
  // 3. VALIDATION ERROR
  // ==========================================================

  if (!validation.valid) {
    return {
      success: false,

      attempt:
        context.attempt,

      grading: null,

      alreadySubmitted: false,

      answers: null,

      error:
        validation.error,
    };
  }

  // ==========================================================
  // 4. ALREADY SUBMITTED
  // ==========================================================

  if (
    validation.state ===
    "SUBMITTED"
  ) {
    return {
      success: true,

      attempt:
        context.attempt,

      grading: null,

      alreadySubmitted: true,

      answers:
        context.attempt.answers,
    };
  }

  // ==========================================================
  // 5. ACTIVE / EXPIRED
  // ==========================================================

  /**
   * ACTIVE và EXPIRED đều phải chấm
   * bằng cùng một grading engine.
   *
   * Điểm khác biệt chỉ nằm ở:
   *
   * ACTIVE  → học sinh chủ động nộp
   * EXPIRED → hệ thống tự chốt vì hết giờ
   */

  const grading =
    gradeExam({
      answers:
        prepared.answers,

      answerKey:
        context.answerKey,

      questionConfig:
        context.questionConfig,

      examType:
        context.examType,

      passingScore:
        context.passingScore,
    });

  // ==========================================================
  // 6. RETURN
  // ==========================================================

  return {
    success: true,

    attempt:
      context.attempt,

    grading,

    alreadySubmitted: false,

    answers:
      prepared.answers,
  };
}