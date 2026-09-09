import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/student";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    await requireStudent();

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu khoảng thời gian cần lấy thời khóa biểu.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_schedule")
      .select(`
        id,
        session_date,
        content,
        start_time,
        note,
        reminder
      `)
      .eq("is_active", true)
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("[STUDENT SCHEDULE] GET error:", error);

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
    console.error("[STUDENT SCHEDULE] GET exception:", error);

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