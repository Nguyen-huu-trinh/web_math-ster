import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requireRole([
      UserRole.TEACHER,
    ]);

    const { id: examId } = await context.params;

    if (!examId) {
      return NextResponse.json(
        {
          error: "Thiếu mã đề thi.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    // =====================================================
    // LẤY CÁC LẦN LÀM BÀI
    // =====================================================

    const { data: attempts, error } =
      await supabase
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
          duration_seconds
        `)
        .eq("exam_id", examId)
        .not("submitted_at", "is", null)
        .order("submitted_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "GET EXAM ATTEMPTS ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // =====================================================
    // LẤY THÔNG TIN HỌC SINH
    // =====================================================

    const studentIds = [
      ...new Set(
        attempts.map(
          (attempt) => attempt.student_id
        )
      ),
    ];

    const { data: profiles, error: profileError } =
      await supabase
        .from("profiles")
        .select(`
          id,
          student_code,
          full_name
        `)
        .in("id", studentIds);

    if (profileError) {
      console.error(
        "GET STUDENT PROFILES ERROR:",
        profileError
      );

      return NextResponse.json(
        {
          error: profileError.message,
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // GHÉP ATTEMPT + PROFILE
    // =====================================================

    const profileMap = new Map(
      (profiles ?? []).map(
        (profile) => [
          profile.id,
          profile,
        ]
      )
    );

    const data = attempts.map(
      (attempt) => {
        const student =
          profileMap.get(
            attempt.student_id
          );

        return {
          id: attempt.id,

          student_id:
            attempt.student_id,

          student_code:
            student?.student_code ?? "",

          full_name:
            student?.full_name ??
            "Học sinh",

          attempt_number:
            attempt.attempt_number,

          score:
            attempt.score,

          is_passed:
            attempt.is_passed,

          started_at:
            attempt.started_at,

          submitted_at:
            attempt.submitted_at,

          duration_seconds:
            attempt.duration_seconds,
        };
      }
    );

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "GET EXAM ANSWERS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}