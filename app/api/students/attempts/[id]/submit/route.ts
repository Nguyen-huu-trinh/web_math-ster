import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/student";
import { submitExam } from "@/lib/exam/submit/orchestrator";
import { submitContextRepository } from "@/lib/exam/submit/supabase-context-repository";
import type { SubmitReason } from "@/lib/exam/submit/types";

export const dynamic = "force-dynamic";

function json(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate, max-age=0");
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: Context
) {
  try {
    // 1. Auth check an toàn (Tránh văng 500 khi hết session)
    let student;
    try {
      student = await requireStudent();
    } catch (error) {
      const e = error as Error & { status?: number };
      if (e.message !== "Unauthorized" && e.status !== 401 && e.status !== 403) throw error;
      return json(
        { error: e.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: e.status === 403 ? 403 : 401 }
      );
    }

    const resolvedParams = await params;
    const attemptId = resolvedParams?.id;

    if (!attemptId) {
      return json(
        { error: "Thiếu mã lượt làm bài." },
        { status: 400 }
      );
    }

    // 2. Parse Payload
    let body: any;
    try {
      body = await request.json();
    } catch {
      return json(
        { error: "Dữ liệu gửi lên không hợp lệ." },
        { status: 400 }
      );
    }

    if (!body?.answers) {
      return json(
        { error: "Không có dữ liệu đáp án." },
        { status: 400 }
      );
    }

    const allowedReasons: SubmitReason[] = [
      "manual",
      "timeout",
      "fullscreen_exit",
      "page_exit",
    ];

    const reason: SubmitReason = allowedReasons.includes(body.reason)
      ? body.reason
      : "manual";

    // 3. Thực thi Orchestrator Chấm Bài
    const result = await submitExam(
      {
        attemptId,
        studentId: student.id,
        answers: body.answers,
        reason,
      },
      submitContextRepository
    );

    return json({
      success: true,
      attemptId: result.attempt.id,
      score: result.grading.score,
      isPassed: result.grading.passed,
      alreadySubmitted: result.alreadySubmitted ?? false,
      reason: result.reason,
      answers: result.attempt.answers,
    });

  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);

    // Only the orchestrator can confirm success and return the persisted result.
    if (message === "Unauthorized" || error?.status === 401 ||
        error?.code === "PGRST301" || error?.code === "PGRST303") {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error?.status === 403) {
      return json({ error: "Forbidden" }, { status: 403 });
    }

    if (message === "Không tìm thấy lượt làm bài.") {
      return json({ error: message }, { status: 404 });
    }

    if (message === "Không xác định được thời gian làm bài.") {
      return json({ error: message }, { status: 400 });
    }

    console.error("[SUBMIT EXAM SYSTEM ERROR]:", error);

    return json(
      { error: message || "Lỗi hệ thống khi chấm bài." },
      { status: 500 }
    );
  }
}
