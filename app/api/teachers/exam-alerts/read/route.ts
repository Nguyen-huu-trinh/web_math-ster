import { NextResponse } from "next/server";

import { requireTeacher } from "@/lib/auth/teacher";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    await requireTeacher();

const supabase = adminClient;

    const body = await request.json();

    const {
      studentId,
      examId,
      alertType,
      attemptId,
    } = body;

    // =====================================================
    // 1. Kiểm tra dữ liệu đầu vào
    // =====================================================

    if (!studentId || !examId || !alertType) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin cảnh báo.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      alertType !== "FAILED" &&
      alertType !== "OVERDUE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Loại cảnh báo không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // 2. Tìm trạng thái đã xem hiện tại
    // =====================================================

    let query = supabase
      .from("teacher_exam_alert_reads")
      .select("id")
      .eq("student_id", studentId)
      .eq("exam_id", examId)
      .eq("alert_type", alertType);

    if (attemptId) {
      query = query.eq("attempt_id", attemptId);
    } else {
      query = query.is("attempt_id", null);
    }

    const {
      data: existing,
      error: findError,
    } = await query.maybeSingle();

    if (findError) {
      throw findError;
    }

    // =====================================================
    // 3. Nếu đã có → cập nhật thời gian xem
    // =====================================================

    if (existing) {
      const {
        error: updateError,
      } = await supabase
        .from("teacher_exam_alert_reads")
        .update({
          seen_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
      });
    }

    // =====================================================
    // 4. Nếu chưa có → tạo mới
    // =====================================================

    const {
      error: insertError,
    } = await supabase
      .from("teacher_exam_alert_reads")
      .insert({
        student_id: studentId,
        exam_id: examId,
        alert_type: alertType,
        attempt_id: attemptId ?? null,
        seen_at: new Date().toISOString(),
      });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "[TEACHER EXAM ALERT READ API ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể đánh dấu cảnh báo đã xem.",
      },
      {
        status: 500,
      }
    );
  }
}