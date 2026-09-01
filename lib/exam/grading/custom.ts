import type {
  ExamAnswers,
  ExamAnswerKey,
  ExamQuestionConfig,
} from "../types";

import type {
  GradingResult,
} from "./types";

// ============================================================
// CUSTOM GRADING
// ============================================================

interface CustomGradingInput {
  answers: ExamAnswers;

  answerKey: ExamAnswerKey;

  questionConfig: ExamQuestionConfig;

  passingScore: number;
}

// ============================================================
// TRUE / FALSE SCORE
// ============================================================

function getTrueFalseScore(
  correctCount: number
): number {
  switch (correctCount) {
    case 1:
      return 0.1;

    case 2:
      return 0.25;

    case 3:
      return 0.5;

    case 4:
      return 1;

    default:
      return 0;
  }
}

// ============================================================
// MULTIPLE CHOICE
// ============================================================

function gradeMultipleChoice(
  answers: string[],
  answerKey: string[],
  questionCount: number
): number {
  let score = 0;

  for (
    let index = 0;
    index < questionCount;
    index++
  ) {
    const studentAnswer =
      answers[index] ?? "";

    const correctAnswer =
      answerKey[index] ?? "";

    if (
      studentAnswer &&
      studentAnswer === correctAnswer
    ) {
      score += 1;
    }
  }

  return score;
}

// ============================================================
// TRUE / FALSE
// ============================================================

function gradeTrueFalse(
  answers: string[][],
  answerKey: string[][],
  questionCount: number
): number {
  let score = 0;

  for (
    let questionIndex = 0;
    questionIndex < questionCount;
    questionIndex++
  ) {
    const studentQuestion =
      answers[questionIndex] ?? [];

    const correctQuestion =
      answerKey[questionIndex] ?? [];

    let correctCount = 0;

    for (
      let optionIndex = 0;
      optionIndex < 4;
      optionIndex++
    ) {
      const studentAnswer =
        studentQuestion[
          optionIndex
        ] ?? "";

      const correctAnswer =
        correctQuestion[
          optionIndex
        ] ?? "";

      if (
        studentAnswer &&
        studentAnswer === correctAnswer
      ) {
        correctCount++;
      }
    }

    score +=
      getTrueFalseScore(
        correctCount
      );
  }

  return score;
}

// ============================================================
// SHORT ANSWER
// ============================================================

function normalizeShortAnswer(
  value: string[]
): string {
  return value
    .join("")
    .trim()
    .toLowerCase();
}

function gradeShortAnswer(
  answers: string[][],
  answerKey: string[],
  questionCount: number
): number {
  let score = 0;

  for (
    let index = 0;
    index < questionCount;
    index++
  ) {
    const studentAnswer =
      normalizeShortAnswer(
        answers[index] ?? []
      );

    const correctAnswer =
      String(
        answerKey[index] ?? ""
      )
        .trim()
        .toLowerCase();

    if (
      studentAnswer &&
      studentAnswer === correctAnswer
    ) {
      score += 1;
    }
  }

  return score;
}

// ============================================================
// TOTAL QUESTIONS
// ============================================================

function getTotalQuestions(
  questionConfig: ExamQuestionConfig
): number {
  return (
    questionConfig.multipleChoice +
    questionConfig.trueFalse +
    questionConfig.shortAnswer
  );
}

// ============================================================
// GRADE CUSTOM
// ============================================================

export function gradeCustom(
  input: CustomGradingInput
): GradingResult {
  const {
    answers,
    answerKey,
    questionConfig,
    passingScore,
  } = input;

  const multipleChoice =
    gradeMultipleChoice(
      answers.multipleChoice,
      answerKey.multipleChoice,
      questionConfig.multipleChoice
    );

  const trueFalse =
    gradeTrueFalse(
      answers.trueFalse,
      answerKey.trueFalse,
      questionConfig.trueFalse
    );

  const shortAnswer =
    gradeShortAnswer(
      answers.shortAnswer,
      answerKey.shortAnswer,
      questionConfig.shortAnswer
    );

  const totalQuestions =
    getTotalQuestions(
      questionConfig
    );

  const correctScore =
    multipleChoice +
    trueFalse +
    shortAnswer;

  const score =
    totalQuestions > 0
      ? Math.round(
          (
            (correctScore /
              totalQuestions) *
            10
          ) * 100
        ) / 100
      : 0;

  return {
    score,

    passed:
      score >= passingScore,

    breakdown: {
      multipleChoice,

      trueFalse,

      shortAnswer,
    },
  };
}