// ============================================================
// EXAM CORE TYPES
// Dùng chung cho frontend + backend của hệ thống làm bài.
// Không chứa logic chấm điểm, API hay Supabase.
// ============================================================

// ============================================================
// 1. ANSWERS
// ============================================================

export interface ExamAnswers {
  /**
   * Phần trắc nghiệm nhiều lựa chọn.
   *
   * Ví dụ:
   * ["A", "C", "", "D"]
   */
  multipleChoice: string[];

  /**
   * Phần Đúng / Sai.
   *
   * Mỗi câu gồm 4 ý:
   * ["Đ", "S", "S", "Đ"]
   */
  trueFalse: string[][];

  /**
   * Phần trả lời ngắn.
   *
   * Mỗi câu gồm tối đa 4 ký tự:
   * ["1", "2", ".", ""]
   */
  shortAnswer: string[][];
}

// ============================================================
// 2. ANSWER KEY
// ============================================================

export interface ExamAnswerKey {
  multipleChoice: string[];

  trueFalse: string[][];

  /**
   * Đáp án trả lời ngắn trong database
   * hiện có thể là chuỗi.
   *
   * Ví dụ:
   * ["36", "24", "765"]
   */
  shortAnswer: string[];
}

// ============================================================
// 3. QUESTION CONFIG
// ============================================================

export interface ExamQuestionConfig {
  multipleChoice: number;

  trueFalse: number;

  shortAnswer: number;
}

// ============================================================
// 4. EXAM TYPE
// ============================================================

export type ExamType =
  | "MOET"
  | string;

// ============================================================
// 5. EXAM CATEGORY
// ============================================================

export type ExamCategory =
  | "ATTENDANCE"
  | "PERIODIC"
  | string;

// ============================================================
// 6. SUBMIT REASON
// ============================================================

/**
 * Lý do khiến bài thi được submit.
 *
 * Đây là type dùng cho hệ thống submit mới.
 */
export type SubmitReason =
  | "manual"
  | "timeout"
  | "fullscreen_exit"
  | "page_exit";

// ============================================================
// 7. EXAM RESULT
// ============================================================

export interface ExamResult {
  /**
   * Điểm cuối cùng của bài.
   */
  score: number;

  /**
   * Có đạt yêu cầu hay không.
   */
  passed: boolean;

  /**
   * Cho biết attempt đã được submit
   * bởi một request khác trước đó hay chưa.
   */
  alreadySubmitted: boolean;

  /**
   * Có cho phép frontend hiển thị đáp án hay không.
   */
  showAnswer: boolean;

  /**
   * Đáp án học sinh gửi lên.
   *
   * Có thể không trả về trong một số trường hợp,
   * nên để optional.
   */
  answers?: ExamAnswers;

  /**
   * Đáp án chuẩn.
   *
   * Chỉ trả về khi showAnswer = true.
   */
  answerKey?: ExamAnswerKey | null;
}

// ============================================================
// 8. EXAM SESSION
// ============================================================

/**
 * Dữ liệu cần thiết để mở một attempt.
 *
 * Đây là type cho phần session,
 * chưa phải toàn bộ database record.
 */
export interface ExamSession {
  attempt: ExamAttempt;

  exam: ExamInfo;

  pdfUrl: string;

  remainingSeconds: number;

  expiresAt: number;

  savedAnswers: ExamAnswers;
}

// ============================================================
// 9. ATTEMPT
// ============================================================

export interface ExamAttempt {
  id: string;

  exam_id: string;

  student_id: string;

  attempt_number: number;

  started_at: string;

  submitted_at: string | null;

  score: number | null;

  is_passed: boolean | null;

  duration_seconds: number | null;

  answers: ExamAnswers;

  created_at?: string;

  updated_at?: string;
}

// ============================================================
// 10. EXAM INFO
// ============================================================

export interface ExamInfo {
  id: string;

  title: string;

  description?: string | null;

  category: ExamCategory;

  exam_type: ExamType;

  duration_minutes: number;

  max_attempts?: number | null;

  attendance_min_score?: number | null;

  show_answer: boolean;

  exam_file_url: string;

  status?: string;

  is_active?: boolean;

  question_config: ExamQuestionConfig;

  answer_key: ExamAnswerKey;

  exam_duration_days?: number | null;
}

// ============================================================
// 11. SUBMIT REQUEST
// ============================================================

export interface SubmitExamRequest {
  answers: ExamAnswers;

  /**
   * Frontend có thể truyền lý do submit.
   *
   * Backend không được tin reason để quyết định
   * điểm hoặc thời gian hợp lệ.
   */
  reason?: SubmitReason;
}

// ============================================================
// 12. DEADLINE
// ============================================================

export interface ExamDeadline {
  startedAt: number;

  durationSeconds: number;

  expiresAt: number;

  remainingSeconds: number;

  isExpired: boolean;
}