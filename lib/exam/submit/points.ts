import { createClient } from "@/lib/supabase/server";

import type {
  ExamCategory,
} from "../types";

// ============================================================
// POINT UPDATE PARAMS
// ============================================================

export interface AdjustExamPointsParams {
  studentId: string;

  examId: string;

  category: ExamCategory;

  passed: boolean;

  /**
   * ID của attempt vừa submit thành công.
   *
   * Dùng để trace/debug.
   */
  attemptId: string;
}

// ============================================================
// POINT UPDATE RESULT
// ============================================================

export interface AdjustExamPointsResult {
  success: boolean;

  pointDelta: number;
}

// ============================================================
// GET POINT DELTA
// ============================================================

/**
 * Tính số point thay đổi sau khi submit.
 *
 * Quy tắc hiện tại của hệ thống:
 *
 * ATTENDANCE:
 *   đạt    → +10
 *   không đạt → -10
 *
 * Các loại đề khác:
 *   đạt    → +50
 *   không đạt → -50
 */
export function getExamPointDelta(
  category: ExamCategory,
  passed: boolean
): number {
  if (
    category === "ATTENDANCE"
  ) {
    return passed
      ? 10
      : -10;
  }

  return passed
    ? 50
    : -50;
}

// ============================================================
// ADJUST POINTS
// ============================================================

/**
 * Cập nhật point của học sinh.
 *
 * QUAN TRỌNG:
 *
 * Hàm này chỉ được gọi SAU KHI:
 *
 * exam_attempts.submitted_at
 *
 * đã được update thành công.
 */
export async function adjustExamPoints(
  params: AdjustExamPointsParams
): Promise<AdjustExamPointsResult> {
  const supabase =
    await createClient();

  const pointDelta =
    getExamPointDelta(
      params.category,
      params.passed
    );

  // ==========================================================
  // RPC
  // ==========================================================

 const {
  error,
} = await supabase.rpc(
  "adjust_student_points",
  {
    p_student_id:
      params.studentId,

    p_delta:
      pointDelta,
  }
);

  if (error) {
    console.error(
      "[EXAM POINTS ERROR]",
      {
        error,
        studentId:
          params.studentId,
        examId:
          params.examId,
        attemptId:
          params.attemptId,
      }
    );

    throw new Error(
      error.message
    );
  }

  return {
    success: true,

    pointDelta,
  };
}