import {
  processSubmit,
} from "./engine";

import {
  saveExamSubmit,
} from "./save";

import type {
  SubmitExamInput,
  SubmitExamResult,
} from "./types";

import type {
  SubmitContextRepository,
} from "./context";

import {
  isExamExpired,
} from "../deadline";

// ============================================================
// SUBMIT EXAM
// ============================================================

export async function submitExam(
  input: SubmitExamInput,
  contextRepository: SubmitContextRepository
): Promise<SubmitExamResult> {
  // ==========================================================
  // 1. LOAD CONTEXT
  // ==========================================================

  const context =
    await contextRepository.getSubmitContext(
      input.attemptId,
      input.studentId
    );

  if (!context) {
    throw new Error(
      "Không tìm thấy lượt làm bài."
    );
  }

  // ==========================================================
  // 2. ĐÃ SUBMIT
  // ==========================================================

  /**
   * Nếu attempt đã submit trước đó,
   * tuyệt đối không chấm lại.
   */
  if (context.attempt.submitted_at) {
    return {
      attempt:
        context.attempt,

      grading: {
        score:
          Number(
            context.attempt.score ?? 0
          ),

        passed:
          Boolean(
            context.attempt.is_passed
          ),
      } as any,

      alreadySubmitted: true,

      reason:
        input.reason ??
        "manual",
    };
  }

  // ==========================================================
  // 3. XÁC ĐỊNH TIMEOUT
  // ==========================================================

  const durationSeconds =
    context.attempt.duration_seconds;

  if (
    durationSeconds === null ||
    durationSeconds === undefined
  ) {
    throw new Error(
      "Không xác định được thời gian làm bài."
    );
  }

  const expired =
    isExamExpired(
      context.attempt.started_at,
      durationSeconds
    );

  /**
   * Backend tự xác định timeout.
   *
   * Không tin:
   * - timer frontend
   * - reason frontend
   * - remainingSeconds frontend
   */
  const reason =
    expired
      ? "timeout"
      : input.reason ?? "manual";

  // ==========================================================
  // 4. PROCESS
  // ==========================================================

  const engineResult =
    processSubmit(
      {
        ...input,

        reason,
      },
      context
    );

  // ==========================================================
  // 5. ENGINE ERROR
  // ==========================================================

  if (!engineResult.success) {
    throw new Error(
      engineResult.error?.message ??
        "Không thể xử lý bài làm."
    );
  }

  // ==========================================================
  // 6. ĐÃ SUBMIT BỞI REQUEST KHÁC
  // ==========================================================

  if (
    engineResult.alreadySubmitted
  ) {
    const attempt =
      engineResult.attempt ??
      context.attempt;

    return {
      attempt,

      grading: {
        score:
          Number(
            attempt.score ?? 0
          ),

        passed:
          Boolean(
            attempt.is_passed
          ),
      } as any,

      alreadySubmitted: true,

      reason,
    };
  }

  // ==========================================================
  // 7. PHẢI CÓ GRADING + ANSWERS
  // ==========================================================

  if (
    !engineResult.grading ||
    !engineResult.answers
  ) {
    throw new Error(
      "Không có kết quả chấm bài."
    );
  }

  // ==========================================================
  // 8. SAVE ATTEMPT
  // ==========================================================

  const saved =
    await saveExamSubmit({
      attemptId:
        input.attemptId,

      studentId:
        input.studentId,

      answers:
        engineResult.answers,

      score:
        engineResult.grading.score,

      isPassed:
        engineResult.grading.passed,

      submittedAt:
        new Date().toISOString(),
    });

  // ==========================================================
  // 9. REQUEST KHÁC ĐÃ SAVE TRƯỚC
  // ==========================================================

  if (!saved.submitted) {
    const attempt =
      saved.attempt ??
      context.attempt;

    return {
      attempt,

      grading: {
        score:
          Number(
            attempt.score ?? 0
          ),

        passed:
          Boolean(
            attempt.is_passed
          ),
      } as any,

      alreadySubmitted: true,

      reason,
    };
  }

  // ==========================================================
  // 11. RETURN
  // ==========================================================

  return {
    attempt:
      saved.attempt!,

    grading:
      engineResult.grading,

    alreadySubmitted: false,

    reason,
  };
}
