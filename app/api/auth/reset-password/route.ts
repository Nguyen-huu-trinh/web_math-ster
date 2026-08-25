import {
  NextResponse,
} from "next/server";

import crypto from "crypto";

import {
  adminClient,
} from "@/lib/supabase/admin";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const resetToken =
      body.resetToken;

    const password =
      body.password;

    if (
      !resetToken ||
      !password
    ) {
      return NextResponse.json(
        {
          message:
            "Thiếu thông tin.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message:
            "Mật khẩu phải có ít nhất 8 ký tự.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // HASH RESET TOKEN
    // ==========================================

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // ==========================================
    // TÌM RESET TOKEN
    // ==========================================

    const {
      data: resetCode,
      error,
    } = await adminClient
      .from("password_reset_codes")
      .select(`
        id,
        student_id,
        reset_token_hash,
        reset_token_expires_at
      `)
      .eq(
        "reset_token_hash",
        tokenHash
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!resetCode) {
      return NextResponse.json(
        {
          message:
            "Reset token không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // KIỂM TRA HẾT HẠN
    // ==========================================

    if (
      !resetCode.reset_token_expires_at ||
      new Date(
        resetCode.reset_token_expires_at
      ).getTime() <
        Date.now()
    ) {
      return NextResponse.json(
        {
          message:
            "Phiên khôi phục đã hết hạn.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CẬP NHẬT SUPABASE AUTH
    // ==========================================

    const {
      error: authError,
    } =
      await adminClient.auth.admin
        .updateUserById(
          resetCode.student_id,
          {
            password,
          }
        );

    if (authError) {
      console.error(
        "[RESET PASSWORD] AUTH ERROR:",
        authError
      );

      return NextResponse.json(
        {
          message:
            "Không thể cập nhật mật khẩu.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // XÓA RESET TOKEN
    // ==========================================

    await adminClient
      .from("password_reset_codes")
      .delete()
      .eq(
        "id",
        resetCode.id
      );

    return NextResponse.json({
      success: true,

      message:
        "Đổi mật khẩu thành công.",
    });

  } catch (error) {
    console.error(
      "[RESET PASSWORD ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Không thể đổi mật khẩu.",
      },
      {
        status: 500
      }
    );
  }
}