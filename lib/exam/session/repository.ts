import type { ExamSession } from "./types";

// ============================================================
// EXAM SESSION REPOSITORY
// ============================================================

/**
 * Repository chịu trách nhiệm lấy dữ liệu cần thiết
 * để mở / resume một attempt.
 *
 * Không chứa:
 * - React
 * - UI
 * - timer frontend
 * - logic submit
 * - logic chấm điểm
 *
 * Repository chỉ có nhiệm vụ lấy dữ liệu từ database.
 */
export interface ExamSessionRepository {
  /**
   * Lấy session của một attempt thuộc về học sinh.
   *
   * attemptId:
   *   ID của attempt.
   *
   * studentId:
   *   ID học sinh đang đăng nhập.
   *
   * Nếu attempt không tồn tại hoặc không thuộc
   * học sinh thì trả về null.
   */
  getStudentExamSession(
    studentId: string,
    attemptId: string
  ): Promise<ExamSession | null>;

  /**
   * Lấy session để giáo viên xem lại bài.
   *
   * Giáo viên không cần studentId vì quyền truy cập
   * sẽ được kiểm tra ở tầng auth / route / repository.
   */
  getTeacherExamSession(
    attemptId: string
  ): Promise<ExamSession | null>;
}