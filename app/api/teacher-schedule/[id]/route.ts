import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth/teacher";
import { createClient } from "@/lib/supabase/server";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    await requireTeacher();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu mã lịch học.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      session_date,
      content,
      start_time,
      note,
      reminder,
      is_active,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (session_date !== undefined) {
      if (
        typeof session_date !== "string" ||
        !isValidDate(session_date)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Ngày học không hợp lệ.",
          },
          { status: 400 }
        );
      }

      updateData.session_date = session_date;
    }

    if (content !== undefined) {
      if (
        typeof content !== "string" ||
        !content.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Nội dung buổi học không được để trống.",
          },
          { status: 400 }
        );
      }

      updateData.content = content.trim();
    }

    if (start_time !== undefined) {
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

      updateData.start_time = start_time;
    }

    if (note !== undefined) {
      if (
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

      updateData.note =
        typeof note === "string"
          ? note.trim() || null
          : null;
    }

    if (reminder !== undefined) {
      if (
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

      updateData.reminder =
        typeof reminder === "string"
          ? reminder.trim() || null
          : null;
    }

    if (is_active !== undefined) {
      if (typeof is_active !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "Trạng thái lịch học không hợp lệ.",
          },
          { status: 400 }
        );
      }

      updateData.is_active = is_active;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Không có dữ liệu cần cập nhật.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_schedule")
      .update(updateData)
      .eq("id", id)
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
      console.error(
        "[TEACHER SCHEDULE] PATCH error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Không thể cập nhật lịch học.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "[TEACHER SCHEDULE] PATCH exception:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật lịch học.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    await requireTeacher();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu mã lịch học.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("student_schedule")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "[TEACHER SCHEDULE] DELETE error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Không thể xóa lịch học.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa lịch học.",
    });
  } catch (error) {
    console.error(
      "[TEACHER SCHEDULE] DELETE exception:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể xóa lịch học.",
      },
      { status: 500 }
    );
  }
}