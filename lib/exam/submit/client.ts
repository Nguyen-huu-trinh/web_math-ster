"use client";

import { apiClient } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import type { SubmitExamResponse, SubmitReason } from "@/components/exams/answer-sheet/use-exam-submit";

export const draftKey = (attemptId: string) => `exam-submit:v1:${attemptId}`;

export function readExamDraft(attemptId: string): SubmitExamResponse["answers"] {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey(attemptId)) ?? "null");
    const answers = draft?.answers;
    if (!answers || !Array.isArray(answers.multipleChoice) ||
        !answers.multipleChoice.every((v: unknown) => typeof v === "string") ||
        ![answers.trueFalse, answers.shortAnswer].every((rows) =>
          Array.isArray(rows) && rows.every((row: unknown) => Array.isArray(row) &&
            row.every((v: unknown) => typeof v === "string")))) return undefined;
    return answers;
  } catch { return undefined; }
}

export function isRetryableSubmitError(error: unknown) {
  const e = error as { status?: number; message?: string; name?: string; code?: string };
  if (e?.status === 401 || e?.status === 408 || e?.status === 429 || (e?.status ?? 0) >= 500) return true;
  if (e?.status && e.status >= 400) return false;
  return e?.name === "TypeError" || e?.name === "AbortError" || e?.name === "TimeoutError" ||
    /network|fetch failed|failed to fetch|offline|timeout|JWT.*expired|invalid.*session|session.*invalid/i.test(e?.message ?? "");
}

// Share refresh within this tab; Supabase's auth lock also coordinates SDK refreshes.
let refreshing: ReturnType<ReturnType<typeof createClient>["auth"]["refreshSession"]> | undefined;

async function authDeadline<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([operation, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error("Hết thời gian đồng bộ phiên đăng nhập."),
        { name: "TimeoutError" })), 15_000);
    })]);
  } finally { if (timer !== undefined) clearTimeout(timer); }
}

async function refresh() {
  if (!refreshing) {
    const pending = createClient().auth.refreshSession();
    refreshing = pending;
    // A deadline cannot cancel the SDK auth lock. Keep sharing the operation until
    // it actually settles, rather than starting competing refreshes after timeout.
    const clear = () => { if (refreshing === pending) refreshing = undefined; };
    void pending.then(clear, clear);
  }
  const { data, error } = await authDeadline(refreshing);
  if (error) throw error;
  if (!data.session) throw Object.assign(new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại; bài làm đã được giữ trên thiết bị."), { status: 401 });
}

export async function submitExamWithRecovery(
  attemptId: string,
  answers: NonNullable<SubmitExamResponse["answers"]>,
  reason: SubmitReason,
): Promise<SubmitExamResponse> {
  // Snapshot before any auth/network await, so every retry sends the same answers.
  const payload = JSON.parse(JSON.stringify({ answers, reason }));
  try {
    localStorage.setItem(draftKey(attemptId), JSON.stringify(payload));
  } catch (error) {
    // Storage can be disabled/full; do not prevent an online submission.
    console.error("[EXAM] Cannot persist submission backup", error);
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await authDeadline(createClient().auth.getSession());
      if (error) throw error;
      if (attempt > 0 || !data.session || (data.session.expires_at ?? 0) * 1000 < Date.now() + 60_000) {
        await refresh();
      }
      const result = await apiClient.post<SubmitExamResponse>(
        `/api/students/attempts/${attemptId}/submit`, payload,
        { signal: AbortSignal.timeout(30_000) },
      );
      if (!result.success || result.attemptId !== attemptId) throw new Error("Phản hồi nộp bài không hợp lệ.");
      try { localStorage.removeItem(draftKey(attemptId)); } catch { /* storage unavailable */ }
      return result;
    } catch (error) {
      if (attempt === 2 || !isRetryableSubmitError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw new Error("Không thể nộp bài.");
}
