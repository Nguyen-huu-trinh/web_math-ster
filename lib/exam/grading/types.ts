import type {
  ExamAnswers,
  ExamAnswerKey,
  ExamQuestionConfig,
} from "../types";

// ============================================================
// GRADING TYPES
// ============================================================

export interface GradingInput {
  answers: ExamAnswers;

  answerKey: ExamAnswerKey;

  questionConfig: ExamQuestionConfig;
}

// ============================================================
// QUESTION RESULT
// ============================================================

export interface QuestionGradeResult {
  correct: boolean;

  score: number;
}

// ============================================================
// GRADING RESULT
// ============================================================

export interface GradingResult {
  score: number;

  passed: boolean;

  /**
   * Điểm chi tiết của từng phần.
   */
  breakdown: {
    multipleChoice: number;

    trueFalse: number;

    shortAnswer: number;
  };
}

// ============================================================
// GRADING OPTIONS
// ============================================================

export interface GradingOptions {
  /**
   * Điểm tối thiểu để đạt.
   *
   * Ví dụ:
   * 5 → đạt từ 5 điểm.
   */
  passingScore: number;
}