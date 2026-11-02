import { gradeExam } from "./grading";

import type {
  ExamAnswers,
  ExamAnswerKey,
  ExamQuestionConfig,
  ExamType,
  ExamCategory,
} from "./types";

// ============================================================
// INPUT
// ============================================================

export interface RegradeAttemptInput {
  attemptId: string;

  studentId: string;

  answers: ExamAnswers;

  oldScore: number | null;

  oldPassed: boolean | null;
}

// ============================================================
// CONTEXT
// ============================================================

export interface RegradeContext {
  answerKey: ExamAnswerKey;

  questionConfig: ExamQuestionConfig;

  examType: ExamType;

  category: ExamCategory;

  passingScore: number;
}

// ============================================================
// RESULT
// ============================================================

export interface RegradeAttemptResult {
  attemptId: string;

  studentId: string;

  oldScore: number | null;

  newScore: number;

  oldPassed: boolean | null;

  newPassed: boolean;

  changed: boolean;
}

// ============================================================
// REGRADE ONE ATTEMPT
// ============================================================

export function regradeAttempt(
  input: RegradeAttemptInput,
  context: RegradeContext
): RegradeAttemptResult {
  // ==========================================================
  // 1. CHẤM LẠI BẰNG GRADING ENGINE MỚI
  // ==========================================================

  const grading = gradeExam({
    answers: input.answers,

    answerKey: context.answerKey,

    questionConfig:
      context.questionConfig,

    examType:
      context.examType,

    passingScore:
      context.passingScore,
  });

  const newScore = Number(
    grading.score.toFixed(2)
  );

  const newPassed =
    grading.passed;

  // ==========================================================
  // 2. KẾT QUẢ
  // ==========================================================

  return {
    attemptId:
      input.attemptId,

    studentId:
      input.studentId,

    oldScore:
      input.oldScore,

    newScore,

    oldPassed:
      input.oldPassed,

    newPassed,

    changed:
      input.oldScore !== newScore ||
      input.oldPassed !== newPassed,
  };
}
