import type {
  ExamAnswers,
  ExamAttempt,
  ExamInfo,
} from "../types";

// ============================================================
// EXAM SESSION
// ============================================================

export interface ExamSession {
  /**
   * Attempt hiện tại của học sinh.
   */
  attempt: ExamAttempt;

  /**
   * Thông tin đề thi.
   */
  exam: ExamInfo;

  /**
   * URL file PDF của đề.
   */
  pdfUrl: string;

  /**
   * Số giây còn lại tại thời điểm
   * server tạo session.
   *
   * Chỉ dùng để khởi tạo timer UI.
   */
  remainingSeconds: number;

  /**
   * Thời điểm tuyệt đối attempt hết hạn.
   *
   * Đây mới là mốc thời gian quan trọng.
   */
  expiresAt: number;

  /**
   * Đáp án học sinh đã có trong attempt.
   */
  savedAnswers: ExamAnswers;
}