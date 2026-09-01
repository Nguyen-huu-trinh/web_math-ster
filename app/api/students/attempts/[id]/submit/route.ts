import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";

import {
  submitExam,
} from "@/lib/exam/submit/orchestrator";

import {
  submitContextRepository,
} from "@/lib/exam/submit/supabase-context-repository";

import type {
  SubmitReason,
} from "@/lib/exam/submit/types";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================
// POST /api/students/attempts/[id]/submit
// ============================================================

export async function POST(
  request: Request,
  { params }: Context
) {
  try {
    // ========================================================
    // 1. AUTH
    // ========================================================

    const student =
      await requireStudent();

    // ========================================================
    // 2. ATTEMPT ID
    // ========================================================

    const { id: attemptId } =
      await params;

    if (!attemptId) {
      return NextResponse.json(
        {
          error:
            "Thiếu mã lượt làm bài.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // 3. REQUEST BODY
    // ========================================================

    let body: any;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Dữ liệu gửi lên không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body?.answers) {
      return NextResponse.json(
        {
          error:
            "Không có dữ liệu đáp án.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // 4. SUBMIT REASON
    // ========================================================

    const allowedReasons: SubmitReason[] =
      [
        "manual",
        "timeout",
        "fullscreen_exit",
        "page_exit",
      ];

    const reason: SubmitReason =
      allowedReasons.includes(
        body.reason
      )
        ? body.reason
        : "manual";

    // ========================================================
    // 5. SUBMIT ENGINE
    // ========================================================

    console.log(
      "[SUBMIT] START",
      {
        attemptId,
        studentId:
          student.id,
        reason,
      }
    );

    const result =
      await submitExam(
        {
          attemptId,

          studentId:
            student.id,

          answers:
            body.answers,

          reason,
        },

        submitContextRepository
      );

    // ========================================================
    // 6. SUCCESS
    // ========================================================

    console.log(
      "[SUBMIT] SUCCESS",
      {
        attemptId,

        studentId:
          student.id,

        score:
          result.grading.score,

        alreadySubmitted:
          result.alreadySubmitted,

        reason:
          result.reason,
      }
    );

    return NextResponse.json({
      success: true,

      attemptId:
        result.attempt.id,

      score:
        result.grading.score,

      isPassed:
        result.grading.passed,

      alreadySubmitted:
        result.alreadySubmitted,

      reason:
        result.reason,

      answers:
        result.attempt.answers,
    });

  } catch (error) {
    // ========================================================
    // ERROR
    // ========================================================

    console.error(
      "[SUBMIT] ERROR",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    // ========================================================
    // UNAUTHORIZED
    // ========================================================

    if (
      message ===
      "Unauthorized"
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (
      message ===
      "Không tìm thấy lượt làm bài."
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // CONFLICT
    // ========================================================

    if (
      message ===
      "Bài làm đã được nộp."
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // INVALID TIME
    // ========================================================

    if (
      message ===
      "Không xác định được thời gian làm bài."
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // GENERIC ERROR
    // ========================================================

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}