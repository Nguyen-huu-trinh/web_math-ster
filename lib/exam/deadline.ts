import type { ExamDeadline } from "./types";

// ============================================================
// EXAM DEADLINE
// ============================================================

/**
 * Tính deadline của một attempt.
 *
 * Công thức:
 *
 * started_at + duration_seconds
 *
 * Không phụ thuộc vào timer của React.
 * Không phụ thuộc vào remainingSeconds từ frontend.
 */
export function getExamDeadline(
  startedAt: string | number | Date,
  durationSeconds: number
): ExamDeadline {
  const startedAtMs =
    startedAt instanceof Date
      ? startedAt.getTime()
      : typeof startedAt === "number"
        ? startedAt
        : new Date(startedAt).getTime();

  if (!Number.isFinite(startedAtMs)) {
    throw new Error(
      "Thời điểm bắt đầu bài thi không hợp lệ."
    );
  }

  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0
  ) {
    throw new Error(
      "Thời gian làm bài không hợp lệ."
    );
  }

  const expiresAt =
    startedAtMs +
    durationSeconds * 1000;

  const now = Date.now();

  const remainingMilliseconds =
    Math.max(
      0,
      expiresAt - now
    );

  const remainingSeconds =
    Math.ceil(
      remainingMilliseconds / 1000
    );

  return {
    startedAt: startedAtMs,

    durationSeconds,

    expiresAt,

    remainingSeconds,

    isExpired:
      now >= expiresAt,
  };
}

// ============================================================
// DEADLINE FROM DATE
// ============================================================

/**
 * Trả về timestamp deadline.
 *
 * Dùng khi backend cần kiểm tra:
 *
 * "Attempt này đã hết giờ chưa?"
 */
export function getExamExpiresAt(
  startedAt: string | number | Date,
  durationSeconds: number
): number {
  const startedAtMs =
    startedAt instanceof Date
      ? startedAt.getTime()
      : typeof startedAt === "number"
        ? startedAt
        : new Date(startedAt).getTime();

  if (!Number.isFinite(startedAtMs)) {
    throw new Error(
      "Thời điểm bắt đầu bài thi không hợp lệ."
    );
  }

  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0
  ) {
    throw new Error(
      "Thời gian làm bài không hợp lệ."
    );
  }

  return (
    startedAtMs +
    durationSeconds * 1000
  );
}

// ============================================================
// CHECK EXPIRED
// ============================================================

/**
 * Kiểm tra attempt đã hết thời gian hay chưa.
 *
 * Đây là hàm quan trọng nhất cho backend.
 *
 * Không nhận remainingSeconds từ frontend.
 */
export function isExamExpired(
  startedAt: string | number | Date,
  durationSeconds: number,
  now = Date.now()
): boolean {
  const expiresAt =
    getExamExpiresAt(
      startedAt,
      durationSeconds
    );

  return now >= expiresAt;
}

// ============================================================
// REMAINING SECONDS
// ============================================================

/**
 * Tính số giây còn lại.
 *
 * Hàm này chỉ dùng để HIỂN THỊ timer.
 *
 * Backend vẫn phải tự kiểm tra deadline.
 */
export function getRemainingSeconds(
  startedAt: string | number | Date,
  durationSeconds: number,
  now = Date.now()
): number {
  const expiresAt =
    getExamExpiresAt(
      startedAt,
      durationSeconds
    );

  return Math.max(
    0,
    Math.ceil(
      (expiresAt - now) / 1000
    )
  );
}

// ============================================================
// FORMAT TIMER
// ============================================================

/**
 * Chuyển số giây thành HH:MM:SS hoặc MM:SS.
 *
 * Ví dụ:
 *
 * 3600 → 01:00:00
 * 125  → 02:05
 * 60   → 01:00
 * 0    → 00:00
 */
export function formatExamTime(
  seconds: number
): string {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const hours =
    Math.floor(
      safeSeconds / 3600
    );

  const minutes =
    Math.floor(
      (safeSeconds % 3600) / 60
    );

  const remainingSeconds =
    safeSeconds % 60;

  const mm =
    String(minutes).padStart(
      2,
      "0"
    );

  const ss =
    String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    );

  if (hours > 0) {
    const hh =
      String(hours).padStart(
        2,
        "0"
      );

    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}