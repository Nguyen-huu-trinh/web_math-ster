import { NextResponse } from "next/server";

import { requireProfile } from "@/lib/auth/require-profile";
import { UserRole } from "@/lib/auth/roles";
import { studentRulesService } from "@/services/student-rules.service";

export async function GET() {
  try {
    const profile = await requireProfile();

    if (
      profile.role !== UserRole.STUDENT &&
      profile.role !== UserRole.TEACHER
    ) {
      return NextResponse.json(
        {
          message:
            "Bạn không có quyền xem nội quy.",
        },
        {
          status: 403,
        }
      );
    }

    const rules =
      await studentRulesService.getAll();

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error(
      "[STUDENT RULES GET ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy danh sách nội quy.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const profile = await requireProfile();

    if (profile.role !== UserRole.TEACHER) {
      return NextResponse.json(
        {
          message:
            "Chỉ giáo viên mới có thể thêm nội quy.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const title =
      body.title?.trim();

    const content =
      body.content?.trim();

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
      await studentRulesService.create({
        title,
        content,
      });

    return NextResponse.json(
      {
        success: true,
        data: rule,
        message:
          "Đã thêm nội quy.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "[STUDENT RULES POST ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể thêm nội quy.",
      },
      {
        status: 500,
      }
    );
  }
}