import { NextResponse } from "next/server";

import { requireProfile } from "@/lib/auth/require-profile";
import { UserRole } from "@/lib/auth/roles";
import { studentRulesService } from "@/services/student-rules.service";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: Context
) {
  try {
    const profile =
      await requireProfile();

    if (
      profile.role !== UserRole.TEACHER
    ) {
      return NextResponse.json(
        {
          message:
            "Chỉ giáo viên mới có thể sửa nội quy.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    const body =
      await request.json();

    const title =
      body.title?.trim();

    const content =
      body.content?.trim();

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Thiếu mã nội quy.",
        },
        {
          status: 400,
        }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          message:
            "Vui lòng nhập đề mục nội quy.",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          message:
            "Vui lòng nhập nội dung nội quy.",
        },
        {
          status: 400,
        }
      );
    }

    const rule =
      await studentRulesService.update(
        id,
        {
          title,
          content,
        }
      );

    return NextResponse.json({
      success: true,
      data: rule,
      message:
        "Đã cập nhật nội quy.",
    });
  } catch (error) {
    console.error(
      "[STUDENT RULES PATCH ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật nội quy.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Context
) {
  try {
    const profile =
      await requireProfile();

    if (
      profile.role !== UserRole.TEACHER
    ) {
      return NextResponse.json(
        {
          message:
            "Chỉ giáo viên mới có thể xóa nội quy.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Thiếu mã nội quy.",
        },
        {
          status: 400,
        }
      );
    }

    await studentRulesService.remove(id);

    return NextResponse.json({
      success: true,
      message:
        "Đã xóa nội quy.",
    });
  } catch (error) {
    console.error(
      "[STUDENT RULES DELETE ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể xóa nội quy.",
      },
      {
        status: 500,
      }
    );
  }
}