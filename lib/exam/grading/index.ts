import type {
  ExamAnswers,
  ExamAnswerKey,
  ExamQuestionConfig,
  ExamType,
} from "../types";

import type {
  GradingResult,
} from "./types";

import { gradeTHPT } from "./thpt";
import { gradeCustom } from "./custom";

// ============================================================
// GRADE EXAM
// ============================================================

export interface GradeExamInput {
  answers: ExamAnswers;

  answerKey: ExamAnswerKey;

  questionConfig: ExamQuestionConfig;

  examType: ExamType;

  passingScore: number;
}

/**
 * Cổng duy nhất của grading engine.
 *
 * Repository / Service không cần biết chi tiết
 * cách chấm từng loại đề.
 */
export function gradeExam(
  input: GradeExamInput
): GradingResult {
  const {
    answers,
    answerKey,
    questionConfig,
    examType,
    passingScore,
  } = input;

  // ==========================================================
  // THPT
  // ==========================================================

  if (
    examType === "THPT"
  ) {
    return gradeTHPT({
      answers,
      answerKey,
      questionConfig,
      passingScore,
    });
  }

  // ==========================================================
  // CUSTOM
  // ==========================================================

  return gradeCustom({
    answers,
    answerKey,
    questionConfig,
    passingScore,
  });
}