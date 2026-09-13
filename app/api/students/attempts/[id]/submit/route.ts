import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/student";
import { submitExam } from "@/lib/exam/submit/orchestrator";
import { submitContextRepository } from "@/lib/exam/submit/supabase-context-repository";
import type { SubmitReason } from "@/lib/exam/submit/types";

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
    } catch {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const attemptId = resolvedParams?.id;

    if (!attemptId) {
      return NextResponse.json(
        { error: "Thiếu mã lượt làm bài." },
        { status: 400 }
      );
    }

    // 2. Parse Payload
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Dữ liệu gửi lên không hợp lệ." },
        { status: 400 }
      );
    }

    if (!body?.answers) {
      return NextResponse.json(
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

    return NextResponse.json({
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

    // 4. Xử lý trường hợp bài làm ĐÃ ĐƯỢC NỘP TRƯỚC ĐÓ (Tránh coi đây là lỗi system 500)
    if (message === "Bài làm đã được nộp." || message.includes("already submitted")) {
      return NextResponse.json(
        {
          success: true,
          alreadySubmitted: true,
          message: "Bài làm này đã được hoàn tất trước đó.",
        },
        { status: 200 } // Đưa về HTTP 200 Idempotent để Client ngưng retry
      );
    }

    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (message === "Không tìm thấy lượt làm bài.") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (message === "Không xác định được thời gian làm bài.") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("[SUBMIT EXAM SYSTEM ERROR]:", error);

    return NextResponse.json(
      { error: message || "Lỗi hệ thống khi chấm bài." },
      { status: 500 }
    );
  }
}