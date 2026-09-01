import type {
  ExamAnswers,
  ExamQuestionConfig,
} from "../types";

import {
  normalizeExamAnswersByConfig,
} from "../normalize-answers";

import type {
  SubmitExamInput,
} from "./types";

// ============================================================
// PREPARED ANSWERS
// ============================================================

export interface PreparedSubmit {
  attemptId: string;

  studentId: string;

  answers: ExamAnswers;

  reason: SubmitExamInput["reason"];
}

// ============================================================
// PREPARE SUBMIT
// ============================================================

/**
 * Chuẩn bị dữ liệu trước khi submit.
 *
 * Nhiệm vụ:
 *
 * 1. Lấy answers từ request.
 * 2. Chuẩn hóa answers.
 * 3. Đưa answers về đúng số lượng câu của đề.
 * 4. Tạo một snapshot bất biến về mặt nghiệp vụ.
 *
 * Hàm này KHÔNG:
 * - gọi database
 * - chấm điểm
 * - update attempt
 * - update points
 */
export function prepareSubmit(
  input: SubmitExamInput,
  questionConfig: ExamQuestionConfig
): PreparedSubmit {
  const answers =
    normalizeExamAnswersByConfig(
      input.answers,
      questionConfig
    );

  return {
    attemptId:
      input.attemptId,

    studentId:
      input.studentId,

    answers,

    reason:
      input.reason ?? "manual",
  };
}