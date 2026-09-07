
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
 * ATTENDANCE:
 *
 *   - Đạt lần đầu tiên → +10
 *   - Đã từng đạt      →  0
 *   - Không đạt        →  0
 *
 * Các loại đề khác:
 *
 *   - Đạt     → +50
 *   - Không đạt → -50
 *
 * Lưu ý:
 * Logic "đạt lần đầu" của ATTENDANCE được kiểm tra
 * trong adjustExamPoints(), không xử lý trực tiếp ở đây.
 */
export function getExamPointDelta(
  category: ExamCategory,
  passed: boolean
): number {
  // ----------------------------------------------------------
  // ATTENDANCE
  // ----------------------------------------------------------

  if (category === "ATTENDANCE") {
    // Không đạt đề điểm danh thì không bị trừ điểm.
    if (!passed) {
      return 0;
    }

    // Nếu đạt thì tạm tính +10.
    //
    // Việc kiểm tra đây có phải lần đầu tiên đạt hay không
    // sẽ được thực hiện trong adjustExamPoints().
    return 10;
  }

  // ----------------------------------------------------------
  // OTHER EXAMS
  // ----------------------------------------------------------

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
 *
 * Đối với ATTENDANCE:
 *
 * - Chỉ cộng +10 nếu đây là lần đầu tiên học sinh đạt exam này.
 * - Nếu học sinh đã từng đạt trước đó thì không cộng thêm.
 * - Không đạt không bị trừ điểm.
 */
export async function adjustExamPoints(
  params: AdjustExamPointsParams
): Promise<AdjustExamPointsResult> {
  const supabase = await createClient();

  let pointDelta = 0;

  // ==========================================================
  // ATTENDANCE
  // ==========================================================

if (params.category === "ATTENDANCE") {
  // Không đạt → không trừ điểm
  if (!params.passed) {


    return {
      success: true,
      pointDelta: 0,
    };
  }



  // ========================================================
  // Tìm các attempt TRƯỚC ĐÓ đã đạt
  // ========================================================

  const {
    data: previousPassedAttempts,
    error: previousAttemptError,
  } = await supabase
    .from("exam_attempts")
    .select("id, student_id, exam_id, is_passed, submitted_at")
    .eq("student_id", params.studentId)
    .eq("exam_id", params.examId)
    .eq("is_passed", true)
    .neq("id", params.attemptId)
    .not("submitted_at", "is", null)
    .limit(1);

  if (previousAttemptError) {
    console.error(
      "[EXAM POINTS CHECK PREVIOUS ATTEMPT ERROR]",
      {
        error: previousAttemptError,
        studentId: params.studentId,
        examId: params.examId,
        attemptId: params.attemptId,
      }
    );

    throw new Error(previousAttemptError.message);
  }



  // ========================================================
  // Đã từng đạt → không cộng
  // ========================================================

  if (
    previousPassedAttempts &&
    previousPassedAttempts.length > 0
  ) {
    

    return {
      success: true,
      pointDelta: 0,
    };
  }

  // ========================================================
  // Lần đầu đạt → +10
  // ========================================================

  pointDelta = 10;
}

  // ==========================================================
  // OTHER EXAMS
  // ==========================================================

  else {
    pointDelta = getExamPointDelta(
      params.category,
      params.passed
    );
  }

  // ==========================================================
  // Không có thay đổi point
  // ==========================================================

  if (pointDelta === 0) {
    return {
      success: true,
      pointDelta: 0,
    };
  }

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
        pointDelta,
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
