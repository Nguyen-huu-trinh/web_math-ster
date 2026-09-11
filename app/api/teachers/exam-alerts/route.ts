import { NextResponse } from "next/server";

import { requireTeacher } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireTeacher();

    const supabase =
      await createClient();

    // =====================================================
    // 1. Lấy các bài kiểm tra định kỳ
    // =====================================================

    const {
      data: exams,
      error: examsError,
    } = await supabase
      .from("exams")
      .select(`
        id,
        title,
        category,
        exam_duration_days,
        attendance_min_score
      `)
      .eq("category", "PERIODIC")
      .is("deleted_at", null);

    if (examsError) {
      throw examsError;
    }

    if (!exams || exams.length === 0) {
      return NextResponse.json({
        success: true,
        alerts: [],
      });
    }

    const examIds =
      exams.map((exam) => exam.id);

    // =====================================================
    // 2. Lấy học sinh
    // =====================================================

    const {
      data: students,
      error: studentsError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        student_code,
        created_at
      `)
      .eq("role", "STUDENT")
      .eq("is_active", true);

    if (studentsError) {
      throw studentsError;
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        alerts: [],
      });
    }

    const studentIds =
      students.map(
        (student) => student.id
      );

    // =====================================================
    // 3. Lấy toàn bộ lượt làm KTDK
    // =====================================================

    const {
      data: attempts,
      error: attemptsError,
    } = await supabase
      .from("exam_attempts")
      .select(`
        id,
        student_id,
        exam_id,
        score,
        is_passed,
        submitted_at,
        created_at
      `)
      .in("student_id", studentIds)
      .in("exam_id", examIds)
      .not("submitted_at", "is", null);

    if (attemptsError) {
      throw attemptsError;
    }

    // =====================================================
    // 4. Lấy các cảnh báo giáo viên đã xem
    // =====================================================

const { data: seenAlerts, error: seenAlertsError } =
  await adminClient
    .from("teacher_exam_alert_reads")
    .select(`
      student_id,
      exam_id,
      alert_type,
      attempt_id
    `);

if (seenAlertsError) {
  throw seenAlertsError;
}

console.log(
  "[TEACHER EXAM ALERT SEEN]",
  {
    count: seenAlerts?.length ?? 0,
    error: seenAlertsError,
  }
);
    // =====================================================
    // 5. Tạo key để kiểm tra cảnh báo đã xem
    // =====================================================

    const seenKeys =
      new Set(
        (seenAlerts ?? []).map(
          (item) =>
            [
              item.student_id,
              item.exam_id,
              item.alert_type,
              item.attempt_id ?? "NULL",
            ].join(":")
        )
      );

    const alerts: any[] = [];

    // =====================================================
    // 6. Kiểm tra từng học sinh / từng KTDK
    // =====================================================

    for (const student of students) {
      for (const exam of exams) {

        const studentAttempts =
          (attempts ?? [])
            .filter(
              (attempt) =>
                attempt.student_id ===
                  student.id &&
                attempt.exam_id ===
                  exam.id
            )
            .sort(
              (a, b) =>
                new Date(
                  b.submitted_at
                ).getTime() -
                new Date(
                  a.submitted_at
                ).getTime()
            );

        // =================================================
        // A. CHƯA ĐẠT
        // =================================================

        const lastAttempt =
          studentAttempts[0] ?? null;

        if (
          lastAttempt &&
          lastAttempt.is_passed === false
        ) {
          const key =
            [
              student.id,
              exam.id,
              "FAILED",
              lastAttempt.id,
            ].join(":");

          if (!seenKeys.has(key)) {
            alerts.push({
              id: key,
              type: "FAILED",
              studentId: student.id,
              studentName:
                student.full_name,
              studentCode:
                student.student_code,
              examId: exam.id,
              examTitle:
                exam.title,
              attemptId:
                lastAttempt.id,
              score:
                lastAttempt.score,
              createdAt:
                lastAttempt.created_at,
            });
          }
        }

        // =================================================
        // B. QUÁ HẠN
        // =================================================

        if (
          studentAttempts.length === 0 &&
          exam.exam_duration_days !== null
        ) {
          const createdVN =
            new Date(
              student.created_at
            ).toLocaleDateString(
              "en-CA",
              {
                timeZone:
                  "Asia/Ho_Chi_Minh",
              }
            );

          const todayVN =
            new Date().toLocaleDateString(
              "en-CA",
              {
                timeZone:
                  "Asia/Ho_Chi_Minh",
              }
            );

          const createdDate =
            new Date(createdVN);

          const todayDate =
            new Date(todayVN);

          const daysElapsed =
            Math.floor(
              (
                todayDate.getTime() -
                createdDate.getTime()
              ) /
                (1000 * 60 * 60 * 24)
            );

          const durationDays =
            Number(
              exam.exam_duration_days
            );

          if (
            daysElapsed >
            durationDays
          ) {
            const key =
              [
                student.id,
                exam.id,
                "OVERDUE",
                "NULL",
              ].join(":");

            if (!seenKeys.has(key)) {
              alerts.push({
                id: key,
                type: "OVERDUE",
                studentId:
                  student.id,
                studentName:
                  student.full_name,
                studentCode:
                  student.student_code,
                examId:
                  exam.id,
                examTitle:
                  exam.title,
                attemptId: null,
                overdueDays:
                  daysElapsed -
                  durationDays,
                createdAt:
                  student.created_at,
              });
            }
          }
        }
      }
    }

    // =====================================================
    // 7. Sắp xếp cảnh báo mới nhất
    // =====================================================

    alerts.sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    );

    return NextResponse.json({
      success: true,
      count: alerts.length,
      alerts,
    });

  } catch (error) {
    console.error(
      "[TEACHER EXAM ALERTS GET ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy cảnh báo kiểm tra.",
      },
      {
        status: 500,
      }
    );
  }
}