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
    // =====================================================
    // 1. KIỂM TRA QUYỀN GIÁO VIÊN
    // =====================================================

    await requireRole([
      UserRole.TEACHER,
    ]);

    const { id: examId } =
      await context.params;

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

    const supabase =
      await createClient();

    // =====================================================
    // 2. LẤY CÁC ATTEMPT ĐÃ NỘP CỦA ĐỀ
    // =====================================================

    const {
      data: attempts,
      error: attemptError,
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
        duration_seconds
      `)
      .eq("exam_id", examId)
      .not("submitted_at", "is", null)
      .order("submitted_at", {
        ascending: false,
      });

    if (attemptError) {
      console.error(
        "GET EXAM ATTEMPTS ERROR:",
        attemptError
      );

      return NextResponse.json(
        {
          error: attemptError.message,
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // 3. LẤY TẤT CẢ HỌC SINH
    // =====================================================

    const {
      data: profiles,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        student_code,
        full_name
      `)
      .eq("role", "STUDENT")
      .eq("is_active", true);
      

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
    // 4. TẠO MAP ATTEMPT THEO STUDENT_ID
    // =====================================================

    const attemptMap =
      new Map<string, any>();

    for (const attempt of attempts ?? []) {
      /*
       * Nếu học sinh có nhiều attempt,
       * giữ attempt mới nhất.
       *
       * Vì query đã order submitted_at DESC
       * nên attempt đầu tiên là attempt mới nhất.
       */
      if (
        !attemptMap.has(
          attempt.student_id
        )
      ) {
        attemptMap.set(
          attempt.student_id,
          attempt
        );
      }
    }

    // =====================================================
    // 5. GHÉP HỌC SINH + ATTEMPT
    // =====================================================

    const data =
      (profiles ?? []).map(
        (student) => {

          const attempt =
            attemptMap.get(
              student.id
            );

          // ===============================================
          // HỌC SINH CHƯA LÀM
          // ===============================================

          if (!attempt) {
            return {
              id: null,

              student_id:
                student.id,

              student_code:
                student.student_code ?? "",

              full_name:
                student.full_name ??
                "Học sinh",

              attempt_number: 0,

              score: null,

              is_passed: null,

              started_at: null,

              submitted_at: null,

              duration_seconds: null,
            };
          }

          // ===============================================
          // HỌC SINH ĐÃ LÀM
          // ===============================================

          return {
            id: attempt.id,

            student_id:
              attempt.student_id,

            student_code:
              student.student_code ?? "",

            full_name:
              student.full_name ??
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

    // =====================================================
    // 6. TRẢ KẾT QUẢ
    // =====================================================

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