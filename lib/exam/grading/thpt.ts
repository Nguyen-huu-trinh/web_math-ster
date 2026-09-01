import type {
  ExamAnswers,
  ExamAnswerKey,
  ExamQuestionConfig,
} from "../types";

import type {
  GradingResult,
} from "./types";

// ============================================================
// THPT GRADING
// ============================================================

interface THPTGradingInput {
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
  answerKey: string[]
): number {
  let score = 0;

  const count = Math.min(
    answers.length,
    answerKey.length
  );

  for (
    let index = 0;
    index < count;
    index++
  ) {
    const answer =
      answers[index] ?? "";

    const correct =
      answerKey[index] ?? "";

    if (
      answer &&
      answer === correct
    ) {
      score += 0.25;
    }
  }

  return score;
}

// ============================================================
// TRUE / FALSE
// ============================================================

function gradeTrueFalse(
  answers: string[][],
  answerKey: string[][]
): number {
  let score = 0;

  const questionCount =
    Math.min(
      answers.length,
      answerKey.length
    );

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
  answerKey: string[]
): number {
  let score = 0;

  const questionCount =
    Math.min(
      answers.length,
      answerKey.length
    );

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
      score += 0.5;
    }
  }

  return score;
}

// ============================================================
// GRADE THPT
// ============================================================

export function gradeTHPT(
  input: THPTGradingInput
): GradingResult {
  const {
    answers,
    answerKey,
    passingScore,
  } = input;

  const multipleChoice =
    gradeMultipleChoice(
      answers.multipleChoice,
      answerKey.multipleChoice
    );

  const trueFalse =
    gradeTrueFalse(
      answers.trueFalse,
      answerKey.trueFalse
    );

  const shortAnswer =
    gradeShortAnswer(
      answers.shortAnswer,
      answerKey.shortAnswer
    );

  const score =
    Math.round(
      (
        multipleChoice +
        trueFalse +
        shortAnswer
      ) * 100
    ) / 100;

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