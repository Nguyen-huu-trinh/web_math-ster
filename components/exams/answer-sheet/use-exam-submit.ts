"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";

import { apiClient } from "@/lib/api/client";

export type SubmitReason =
  | "manual"
  | "timeout"
  | "fullscreen_exit"
  | "page_exit";

export interface SubmitExamResponse {
  success: boolean;

  attemptId: string;

  score: number;

  isPassed: boolean;

  alreadySubmitted: boolean;

  reason: SubmitReason;

  answers?: {
    multipleChoice: string[];
    trueFalse: string[][];
    shortAnswer: string[][];
  };
}

interface UseExamSubmitOptions {
  attemptId: string;

  onSuccess?: (
    result: SubmitExamResponse
  ) => void;

  onError?: (
    error: Error
  ) => void;
}

export function useExamSubmit({
  attemptId,
  onSuccess,
  onError,
}: UseExamSubmitOptions) {
  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /**
   * Ref dùng để chống double submit.
   *
   * Không dùng state cho việc này vì:
   *
   * click 1
   * → setSubmitting(true)
   *
   * click 2 có thể xảy ra trước khi
   * React render lại.
   *
   * Ref thay đổi ngay lập tức.
   */
  const submittingRef =
    useRef(false);

  const submit = useCallback(
    async (
      answers: SubmitExamResponse["answers"],
      reason: SubmitReason = "manual"
    ) => {
      // ======================================================
      // 1. CHỐNG DOUBLE SUBMIT
      // ======================================================

      if (submittingRef.current) {
        return null;
      }

      submittingRef.current = true;
      setSubmitting(true);

      try {
        // ====================================================
        // 2. VALIDATE ATTEMPT ID
        // ====================================================

        if (!attemptId) {
          throw new Error(
            "Không tìm thấy mã lượt làm bài."
          );
        }

        if (!answers) {
          throw new Error(
            "Không có dữ liệu đáp án."
          );
        }

        // ====================================================
        // 3. CALL API
        // ====================================================

        const result =
          await apiClient.post<SubmitExamResponse>(
            `/api/students/attempts/${attemptId}/submit`,
            {
              answers,
              reason,
            }
          );

        // ====================================================
        // 4. SUCCESS
        // ====================================================

        onSuccess?.(result);

        return result;
      } catch (error) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error(
                String(error)
              );

        console.error(
          "[EXAM SUBMIT ERROR]",
          normalizedError
        );

        onError?.(
          normalizedError
        );

        throw normalizedError;
      } finally {
        // ====================================================
        // 5. RESET LOCK
        // ====================================================

        /**
         * Không reset khi submit thành công?
         *
         * Không cần dựa vào lock này để ngăn
         * submit lần 2 vì backend đã có
         * submitted_at protection.
         *
         * Tuy nhiên AnswerSheet sẽ chuyển
         * sang submitted state sau success.
         */
        submittingRef.current =
          false;

        setSubmitting(false);
      }
    },
    [
      attemptId,
      onSuccess,
      onError,
    ]
  );

  return {
    submit,
    submitting,
  };
}