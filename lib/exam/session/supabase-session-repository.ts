import { createClient } from "@/lib/supabase/server";

import type {
  ExamAnswerKey,
  ExamAnswers,
  ExamAttempt,
  ExamInfo,
  ExamQuestionConfig,
} from "../types";

import {
  getExamDeadline,
} from "../deadline";

import type {
  ExamSession,
} from "./types";

import type {
  ExamSessionRepository,
} from "./repository";

import {
  normalizeExamAnswers,
} from "../normalize-answers";

// ============================================================
// DATABASE TYPES
// ============================================================

interface ExamRow {
  id: string;

  title: string | null;

  description: string | null;

  category: string | null;

  exam_type: string | null;

  duration_minutes: number | null;

  max_attempts: number | null;

  attendance_min_score: number | null;

  show_answer: boolean | null;

  exam_file_url: string | null;

  status: string | null;

  is_active: boolean | null;

  question_config: unknown;

  answer_key: unknown;
}

interface AttemptRow {
  id: string;

  exam_id: string;

  student_id: string;

  attempt_number: number;

  started_at: string;

  submitted_at: string | null;

  score: number | null;

  is_passed: boolean | null;

  duration_seconds: number | null;

  answers: unknown;

  created_at: string | null;

  updated_at: string | null;
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
// BUILD ATTEMPT
// ============================================================

function buildAttempt(
  row: AttemptRow
): ExamAttempt {
  const durationSeconds =
    row.duration_seconds !==
    null
      ? Number(
          row.duration_seconds
        )
      : null;

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
        : Number(
            row.score
          ),

    is_passed:
      row.is_passed,

    duration_seconds:
      durationSeconds,

    answers:
      normalizeExamAnswers(
        row.answers
      ),

    created_at:
      row.created_at ??
      undefined,

    updated_at:
      row.updated_at ??
      undefined,
  };
}

// ============================================================
// BUILD EXAM
// ============================================================

function buildExam(
  row: ExamRow
): ExamInfo {
  return {
    id: row.id,

    title:
      row.title ??
      "",

    description:
      row.description,

    category:
      row.category ??
      "CUSTOM",

    exam_type:
      row.exam_type ??
      "CUSTOM",

    duration_minutes:
      toNumber(
        row.duration_minutes
      ),

    max_attempts:
      row.max_attempts,

    attendance_min_score:
      row.attendance_min_score,

    show_answer:
      row.show_answer ??
      false,

    exam_file_url:
      row.exam_file_url ??
      "",

    status:
      row.status ??
      undefined,

    is_active:
      row.is_active ??
      undefined,

    question_config:
      normalizeQuestionConfig(
        row.question_config
      ),

    answer_key:
      normalizeAnswerKey(
        row.answer_key
      ),
  };
}

// ============================================================
// BUILD SESSION
// ============================================================

function buildSession(
  attempt: ExamAttempt,
  exam: ExamInfo
): ExamSession {
  // ==========================================================
  // DURATION
  // ==========================================================

  const durationSeconds =
    Number(
      attempt.duration_seconds ??
        exam.duration_minutes *
          60
    );

  if (
    !Number.isFinite(
      durationSeconds
    ) ||
    durationSeconds < 0
  ) {
    throw new Error(
      "Thời gian làm bài không hợp lệ."
    );
  }

  // ==========================================================
  // DEADLINE
  // ==========================================================

  const deadline =
    getExamDeadline(
      attempt.started_at,
      durationSeconds
    );

  // ==========================================================
  // SESSION
  // ==========================================================

  const savedAnswers: ExamAnswers =
    normalizeExamAnswers(
      attempt.answers
    );

  return {
    attempt,

    exam,

    pdfUrl:
      exam.exam_file_url,

    remainingSeconds:
      deadline.remainingSeconds,

    expiresAt:
      deadline.expiresAt,

    savedAnswers,
  };
}

// ============================================================
// SUPABASE SESSION REPOSITORY
// ============================================================

export class SupabaseExamSessionRepository
  implements ExamSessionRepository
{
  // ==========================================================
  // STUDENT SESSION
  // ==========================================================

  async getStudentExamSession(
    studentId: string,
    attemptId: string
  ): Promise<ExamSession | null> {
    const supabase =
      await createClient();

    // ========================================================
    // 1. LOAD ATTEMPT
    // ========================================================

    const {
      data: attemptRow,
      error: attemptError,
    } =
      await supabase
        .from(
          "exam_attempts"
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
        .eq(
          "id",
          attemptId
        )
        .eq(
          "student_id",
          studentId
        )
        .maybeSingle<AttemptRow>();

    if (attemptError) {
      console.error(
        "[EXAM SESSION] STUDENT ATTEMPT ERROR",
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
    } =
      await supabase
        .from("exams")
        .select(`
          id,
          title,
          description,
          category,
          exam_type,
          duration_minutes,
          max_attempts,
          attendance_min_score,
          show_answer,
          exam_file_url,
          status,
          is_active,
          question_config,
          answer_key
        `)
        .eq(
          "id",
          attemptRow.exam_id
        )
        .maybeSingle<ExamRow>();

    if (examError) {
      console.error(
        "[EXAM SESSION] STUDENT EXAM ERROR",
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
    // 3. BUILD DOMAIN OBJECTS
    // ========================================================

    const attempt =
      buildAttempt(
        attemptRow
      );

    const exam =
      buildExam(
        examRow
      );

    // ========================================================
    // 4. BUILD SESSION
    // ========================================================

    return buildSession(
      attempt,
      exam
    );
  }

  // ==========================================================
  // TEACHER SESSION
  // ==========================================================

  async getTeacherExamSession(
    attemptId: string
  ): Promise<ExamSession | null> {
    const supabase =
      await createClient();

    // ========================================================
    // 1. LOAD ATTEMPT
    // ========================================================

    const {
      data: attemptRow,
      error: attemptError,
    } =
      await supabase
        .from(
          "exam_attempts"
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
        .eq(
          "id",
          attemptId
        )
        .maybeSingle<AttemptRow>();

    if (attemptError) {
      console.error(
        "[EXAM SESSION] TEACHER ATTEMPT ERROR",
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
    } =
      await supabase
        .from("exams")
        .select(`
          id,
          title,
          description,
          category,
          exam_type,
          duration_minutes,
          max_attempts,
          attendance_min_score,
          show_answer,
          exam_file_url,
          status,
          is_active,
          question_config,
          answer_key
        `)
        .eq(
          "id",
          attemptRow.exam_id
        )
        .maybeSingle<ExamRow>();

    if (examError) {
      console.error(
        "[EXAM SESSION] TEACHER EXAM ERROR",
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
    // 3. BUILD DOMAIN OBJECTS
    // ========================================================

    const attempt =
      buildAttempt(
        attemptRow
      );

    const exam =
      buildExam(
        examRow
      );

    // ========================================================
    // 4. BUILD SESSION
    // ========================================================

    return buildSession(
      attempt,
      exam
    );
  }
}

// ============================================================
// SINGLETON
// ============================================================

export const examSessionRepository =
  new SupabaseExamSessionRepository();