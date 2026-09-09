import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

export async function GET(request: Request) {
  try {
    await requireTeacher();

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (
      !startDate ||
      !endDate ||
      !isValidDate(startDate) ||
      !isValidDate(endDate)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Khoảng thời gian không hợp lệ.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_schedule")
      .select(
        `
          id,
          session_date,
          content,
          start_time,
          note,
          reminder,
          is_active,
          created_at,
          updated_at
        `
      )
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("[TEACHER SCHEDULE] GET error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Không thể tải thời khóa biểu.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
    });
  } catch (error) {
    console.error("[TEACHER SCHEDULE] GET exception:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải thời khóa biểu.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireTeacher();

    const body = await request.json();

    const {
      session_date,
      content,
      start_time,
      note,
      reminder,
      is_active,
    } = body;

    if (!session_date || !isValidDate(session_date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Ngày học không hợp lệ.",
        },
        { status: 400 }
      );
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập nội dung buổi học.",
        },
        { status: 400 }
      );
    }

    if (
      typeof start_time !== "string" ||
      !isValidTime(start_time)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Giờ bắt đầu không hợp lệ.",
        },
        { status: 400 }
      );
    }

    if (
      note !== undefined &&
      note !== null &&
      typeof note !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Ghi chú không hợp lệ.",
        },
        { status: 400 }
      );
    }

    if (
      reminder !== undefined &&
      reminder !== null &&
      typeof reminder !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nội dung nhắc nhở không hợp lệ.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_schedule")
      .insert({
        session_date,
        content: content.trim(),
        start_time,
        note:
          typeof note === "string"
            ? note.trim() || null
            : null,
        reminder:
          typeof reminder === "string"
            ? reminder.trim() || null
            : null,
        is_active:
          typeof is_active === "boolean"
            ? is_active
            : true,
      })
      .select(
        `
          id,
          session_date,
          content,
          start_time,
          note,
          reminder,
          is_active,
          created_at,
          updated_at
        `
      )
      .single();

    if (error) {
      console.error("[TEACHER SCHEDULE] POST error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Không thể thêm lịch học.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[TEACHER SCHEDULE] POST exception:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể thêm lịch học.",
      },
      { status: 500 }
    );
  }
}