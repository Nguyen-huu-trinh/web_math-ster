import { gradeExam } from "./grading";
import { getExamPointDelta } from "./submit/points";

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

  pointCorrection: number;

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
  // 2. TÍNH POINT CORRECTION
  // ==========================================================

  let pointCorrection = 0;

  if (
    input.oldPassed !== null &&
    input.oldPassed !== newPassed
  ) {
    const oldDelta =
      getExamPointDelta(
        context.category,
        input.oldPassed
      );

    const newDelta =
      getExamPointDelta(
        context.category,
        newPassed
      );

    pointCorrection =
      newDelta - oldDelta;
  }

  // ==========================================================
  // 3. KẾT QUẢ
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

    pointCorrection,

    changed:
      input.oldScore !== newScore ||
      input.oldPassed !== newPassed,
  };
}