import { createClient } from "@/lib/supabase/server";

import type {
  ExamAnswers,
  ExamAttempt,
} from "../types";

// ============================================================
// SAVE SUBMIT PARAMS
// ============================================================

export interface SaveExamSubmitParams {
  attemptId: string;

  studentId: string;

  answers: ExamAnswers;

  score: number;

  isPassed: boolean;

  submittedAt: string;
}

// ============================================================
// SAVE RESULT
// ============================================================

export interface SaveExamSubmitResult {
  success: boolean;

  /**
   * true nếu request hiện tại thực sự
   * chuyển attempt từ chưa submit → đã submit.
   */
  submitted: boolean;

  /**
   * Attempt sau cùng trong database.
   */
  attempt: ExamAttempt | null;
}

// ============================================================
// HELPERS
// ============================================================

function normalizeAnswers(
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

  const data =
    value as Record<
      string,
      unknown
    >;

  return {
    multipleChoice:
      Array.isArray(
        data.multipleChoice
      )
        ? data.multipleChoice.map(
            (value) =>
              typeof value ===
              "string"
                ? value
                : ""
          )
        : [],

    trueFalse:
      Array.isArray(
        data.trueFalse
      )
        ? data.trueFalse.map(
            (question) =>
              Array.isArray(
                question
              )
                ? question.map(
                    (value) =>
                      typeof value ===
                      "string"
                        ? value
                        : ""
                  )
                : []
          )
        : [],

    shortAnswer:
      Array.isArray(
        data.shortAnswer
      )
        ? data.shortAnswer.map(
            (question) =>
              Array.isArray(
                question
              )
                ? question.map(
                    (value) =>
                      typeof value ===
                      "string"
                        ? value
                        : ""
                  )
                : []
          )
        : [],
  };
}

function mapAttempt(
  row: any
): ExamAttempt {
  return {
    id: row.id,

    exam_id:
      row.exam_id,

    student_id:
      row.student_id,

    attempt_number:
      row.attempt_number,

    started_at:
      row.started_at,

    submitted_at:
      row.submitted_at,

    score:
      row.score === null
        ? null
        : Number(row.score),

    is_passed:
      row.is_passed,

    duration_seconds:
      row.duration_seconds,

    answers:
      normalizeAnswers(
        row.answers
      ),

    created_at:
      row.created_at,

    updated_at:
      row.updated_at,
  };
}

// ============================================================
// SAVE SUBMIT
// ============================================================

/**
 * Atomic submit:
 *
 * UPDATE ... WHERE
 *   id = attemptId
 *   AND student_id = studentId
 *   AND submitted_at IS NULL
 *
 * Nếu update trả về 1 row:
 *   request hiện tại submit thành công.
 *
 * Nếu không trả row:
 *   attempt đã được submit trước đó
 *   hoặc không thuộc student hiện tại.
 */
export async function saveExamSubmit(
  params: SaveExamSubmitParams
): Promise<SaveExamSubmitResult> {
  const supabase =
    await createClient();

  // ==========================================================
  // 1. ATOMIC UPDATE
  // ==========================================================

  const {
    data,
    error,
  } = await supabase
    .from("exam_attempts")
    .update({
      answers:
        params.answers,

      submitted_at:
        params.submittedAt,

      score:
        params.score,

      is_passed:
        params.isPassed,

      updated_at:
        params.submittedAt,
    })
    .eq(
      "id",
      params.attemptId
    )
    .eq(
      "student_id",
      params.studentId
    )
    .is(
      "submitted_at",
      null
    )
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
    .maybeSingle();

  // ==========================================================
  // 2. DATABASE ERROR
  // ==========================================================

  if (error) {
    console.error(
      "[SUBMIT SAVE ERROR]",
      error
    );

    throw new Error(
      error.message
    );
  }

  // ==========================================================
  // 3. SUBMIT THÀNH CÔNG
  // ==========================================================

  if (data) {
    return {
      success: true,

      submitted: true,

      attempt:
        mapAttempt(data),
    };
  }

  // ==========================================================
  // 4. KHÔNG UPDATE ĐƯỢC
  // ==========================================================

  /**
   * Có thể xảy ra khi:
   *
   * - attempt đã submit;
   * - attempt không thuộc student;
   * - attempt không tồn tại.
   *
   * Chúng ta chưa coi đây là database error.
   */
  const {
    data: existing,
    error: existingError,
  } = await supabase
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
      params.attemptId
    )
    .eq(
      "student_id",
      params.studentId
    )
    .maybeSingle();

  if (existingError) {
    console.error(
      "[SUBMIT EXISTING ATTEMPT ERROR]",
      existingError
    );

    throw new Error(
      existingError.message
    );
  }

  // ==========================================================
  // 5. ATTEMPT KHÔNG TỒN TẠI
  // ==========================================================

  if (!existing) {
    return {
      success: false,

      submitted: false,

      attempt: null,
    };
  }

  // ==========================================================
  // 6. ATTEMPT ĐÃ ĐƯỢC SUBMIT
  // ==========================================================

  return {
    success: true,

    submitted: false,

    attempt:
      mapAttempt(existing),
  };
}