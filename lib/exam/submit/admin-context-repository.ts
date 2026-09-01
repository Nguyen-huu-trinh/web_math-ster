import type {
  ExamAnswerKey,
  ExamAttempt,
  ExamQuestionConfig,
} from "../types";

import type {
  SubmitContext,
  SubmitContextRepository,
} from "./context";

import {
  normalizeExamAnswers,
} from "../normalize-answers";

import {
  adminClient,
} from "@/lib/supabase/admin";

// ============================================================
// DATABASE TYPES
// ============================================================

interface ExamRow {
  id: string;

  exam_type: string | null;

  category: string | null;

  duration_minutes: number | null;

  show_answer: boolean | null;

  answer_key: unknown;

  question_config: unknown;

  attendance_min_score: number | null;
}

// ============================================================
// HELPERS
// ============================================================

function toNumber(
  value: unknown,
  fallback = 0
): number {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

// ============================================================
// NORMALIZE ANSWER KEY
// ============================================================

function normalizeAnswerKey(
  value: unknown
): ExamAnswerKey {
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

  const key =
    value as Record<
      string,
      unknown
    >;

  const multipleChoice =
    Array.isArray(
      key.multipleChoice
    )
      ? key.multipleChoice.map(
          (answer) =>
            typeof answer ===
            "string"
              ? answer.trim()
              : ""
        )
      : [];

  const trueFalse =
    Array.isArray(
      key.trueFalse
    )
      ? key.trueFalse.map(
          (question) =>
            Array.isArray(
              question
            )
              ? [
                  String(
                    question[0] ??
                      ""
                  ).trim(),

                  String(
                    question[1] ??
                      ""
                  ).trim(),

                  String(
                    question[2] ??
                      ""
                  ).trim(),

                  String(
                    question[3] ??
                      ""
                  ).trim(),
                ]
              : [
                  "",
                  "",
                  "",
                  "",
                ]
        )
      : [];

  const shortAnswer =
    Array.isArray(
      key.shortAnswer
    )
      ? key.shortAnswer.map(
          (answer) =>
            String(
              answer ?? ""
            ).trim()
        )
      : [];

  return {
    multipleChoice,
    trueFalse,
    shortAnswer,
  };
}

// ============================================================
// NORMALIZE QUESTION CONFIG
// ============================================================

function normalizeQuestionConfig(
  value: unknown
): ExamQuestionConfig {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      multipleChoice: 0,
      trueFalse: 0,
      shortAnswer: 0,
    };
  }

  const config =
    value as Record<
      string,
      unknown
    >;

  return {
    multipleChoice:
      toNumber(
        config.multipleChoice
      ),

    trueFalse:
      toNumber(
        config.trueFalse
      ),

    shortAnswer:
      toNumber(
        config.shortAnswer
      ),
  };
}

// ============================================================
// ADMIN SUBMIT CONTEXT REPOSITORY
// ============================================================

/**
 * Repository dùng cho server-side jobs
 * như timeout worker.
 *
 * KHÔNG dùng cookie/session của học sinh.
 *
 * Dùng adminClient vì worker cần xử lý
 * attempt của bất kỳ học sinh nào.
 */
export class AdminSubmitContextRepository
  implements SubmitContextRepository
{
  async getSubmitContext(
    attemptId: string,
    studentId: string
  ): Promise<SubmitContext | null> {
    // ========================================================
    // 1. LOAD ATTEMPT
    // ========================================================

    const {
      data: attemptRow,
      error: attemptError,
    } = await adminClient
      .from("exam_attempts")
      .select(`
        id,
        exam_id,
        student_id,
        attempt_number,
        started_at,
        submitted_at,
        score,
        is_passed,
        duration_seconds,
        answers,
        created_at,
        updated_at
      `)
      .eq(
        "id",
        attemptId
      )
      .eq(
        "student_id",
        studentId
      )
      .maybeSingle();

    if (attemptError) {
      console.error(
        "[ADMIN SUBMIT CONTEXT] ATTEMPT ERROR",
        attemptError
      );

      throw new Error(
        attemptError.message
      );
    }

    if (!attemptRow) {
      return null;
    }

    // ========================================================
    // 2. LOAD EXAM
    // ========================================================

    const {
      data: examRow,
      error: examError,
    } = await adminClient
      .from("exams")
      .select(`
        id,
        exam_type,
        category,
        duration_minutes,
        show_answer,
        answer_key,
        question_config,
        attendance_min_score
      `)
      .eq(
        "id",
        attemptRow.exam_id
      )
      .maybeSingle<ExamRow>();

    if (examError) {
      console.error(
        "[ADMIN SUBMIT CONTEXT] EXAM ERROR",
        examError
      );

      throw new Error(
        examError.message
      );
    }

    if (!examRow) {
      return null;
    }

    // ========================================================
    // 3. DURATION
    // ========================================================

    const durationSeconds =
      attemptRow.duration_seconds ??
      toNumber(
        examRow.duration_minutes
      ) * 60;

    // ========================================================
    // 4. ATTEMPT
    // ========================================================

    const attempt: ExamAttempt = {
      id:
        attemptRow.id,

      exam_id:
        attemptRow.exam_id,

      student_id:
        attemptRow.student_id,

      attempt_number:
        attemptRow.attempt_number,

      started_at:
        attemptRow.started_at,

      submitted_at:
        attemptRow.submitted_at,

      score:
        attemptRow.score === null
          ? null
          : Number(
              attemptRow.score
            ),

      is_passed:
        attemptRow.is_passed,

      duration_seconds:
        durationSeconds,

      answers:
        normalizeExamAnswers(
          attemptRow.answers
        ),

      created_at:
        attemptRow.created_at ??
        undefined,

      updated_at:
        attemptRow.updated_at ??
        undefined,
    };

    // ========================================================
    // 5. ANSWER KEY
    // ========================================================

    const answerKey =
      normalizeAnswerKey(
        examRow.answer_key
      );

    // ========================================================
    // 6. QUESTION CONFIG
    // ========================================================

    const questionConfig =
      normalizeQuestionConfig(
        examRow.question_config
      );

    // ========================================================
    // 7. PASSING SCORE
    // ========================================================

    const passingScore =
      examRow.attendance_min_score ??
      5;

    // ========================================================
    // 8. RETURN CONTEXT
    // ========================================================

    return {
      attempt,

      examId:
        examRow.id,

      examType:
        examRow.exam_type ??
        "CUSTOM",

      category:
        examRow.category ??
        "CUSTOM",

      passingScore,

      questionConfig,

      answerKey,

      showAnswer:
        examRow.show_answer ??
        false,
    };
  }
}

// ============================================================
// SINGLETON
// ============================================================

export const adminSubmitContextRepository =
  new AdminSubmitContextRepository();