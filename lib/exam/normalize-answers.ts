import type { ExamAnswers } from "./types";

// ============================================================
// DEFAULT ANSWERS
// ============================================================

export function createEmptyExamAnswers(
  config?: {
    multipleChoice?: number;
    trueFalse?: number;
    shortAnswer?: number;
  }
): ExamAnswers {
  const multipleChoiceCount =
    config?.multipleChoice ?? 0;

  const trueFalseCount =
    config?.trueFalse ?? 0;

  const shortAnswerCount =
    config?.shortAnswer ?? 0;

  return {
    multipleChoice: Array(
      multipleChoiceCount
    ).fill(""),

    trueFalse: Array.from(
      { length: trueFalseCount },
      () => ["", "", "", ""]
    ),

    shortAnswer: Array.from(
      { length: shortAnswerCount },
      () => ["", "", "", ""]
    ),
  };
}

// ============================================================
// STRING NORMALIZATION
// ============================================================

function normalizeString(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

// ============================================================
// MULTIPLE CHOICE
// ============================================================

function normalizeMultipleChoice(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((answer) =>
    normalizeString(answer)
  );
}

// ============================================================
// TRUE / FALSE
// ============================================================

function normalizeTrueFalse(
  value: unknown
): string[][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((question) => {
    if (!Array.isArray(question)) {
      return ["", "", "", ""];
    }

    return [
      normalizeString(question[0]),
      normalizeString(question[1]),
      normalizeString(question[2]),
      normalizeString(question[3]),
    ];
  });
}

// ============================================================
// SHORT ANSWER
// ============================================================

function normalizeShortAnswer(
  value: unknown
): string[][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((question) => {
    if (!Array.isArray(question)) {
      return ["", "", "", ""];
    }

    return [
      normalizeString(question[0]),
      normalizeString(question[1]),
      normalizeString(question[2]),
      normalizeString(question[3]),
    ];
  });
}

// ============================================================
// NORMALIZE COMPLETE ANSWERS
// ============================================================

/**
 * Chuẩn hóa dữ liệu đáp án từ bất kỳ nguồn nào.
 *
 * Mục tiêu:
 * - Không để undefined/null lọt vào grading.
 * - Không để dữ liệu không phải array gây crash.
 * - Luôn trả về ExamAnswers hợp lệ.
 * - Không thay đổi thứ tự câu hỏi.
 * - Không tự chấm điểm.
 */
export function normalizeExamAnswers(
  value: unknown
): ExamAnswers {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      multipleChoice: [],
      trueFalse: [],
      shortAnswer: [],
    };
  }

  const answers =
    value as Record<string, unknown>;

  return {
    multipleChoice:
      normalizeMultipleChoice(
        answers.multipleChoice
      ),

    trueFalse:
      normalizeTrueFalse(
        answers.trueFalse
      ),

    shortAnswer:
      normalizeShortAnswer(
        answers.shortAnswer
      ),
  };
}

// ============================================================
// NORMALIZE ANSWERS ACCORDING TO QUESTION CONFIG
// ============================================================

/**
 * Đưa đáp án về đúng số lượng câu của đề.
 *
 * Ví dụ đề có:
 * - 10 câu MC
 * - 2 câu Đ/S
 * - 3 câu trả lời ngắn
 *
 * thì kết quả luôn có đúng:
 * - 10 MC
 * - 2 TF
 * - 3 Short Answer
 */
export function normalizeExamAnswersByConfig(
  value: unknown,
  config: {
    multipleChoice: number;
    trueFalse: number;
    shortAnswer: number;
  }
): ExamAnswers {
  const normalized =
    normalizeExamAnswers(value);

  const multipleChoice =
    Array.from(
      {
        length:
          config.multipleChoice,
      },
      (_, index) =>
        normalized.multipleChoice[
          index
        ] ?? ""
    );

  const trueFalse =
    Array.from(
      {
        length:
          config.trueFalse,
      },
      (_, questionIndex) => {
        const question =
          normalized.trueFalse[
            questionIndex
          ];

        return [
          question?.[0] ?? "",
          question?.[1] ?? "",
          question?.[2] ?? "",
          question?.[3] ?? "",
        ];
      }
    );

  const shortAnswer =
    Array.from(
      {
        length:
          config.shortAnswer,
      },
      (_, questionIndex) => {
        const question =
          normalized.shortAnswer[
            questionIndex
          ];

        return [
          question?.[0] ?? "",
          question?.[1] ?? "",
          question?.[2] ?? "",
          question?.[3] ?? "",
        ];
      }
    );

  return {
    multipleChoice,
    trueFalse,
    shortAnswer,
  };
}