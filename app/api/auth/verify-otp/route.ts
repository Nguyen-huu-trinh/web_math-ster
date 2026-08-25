import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminClient } from "@/lib/supabase/admin";
import {
  verifyOtp,
} from "@/lib/auth/password-reset";

import { UserRole } from "@/lib/auth/roles";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const email =
      body.email
        ?.trim()
        .toLowerCase();

    const otp =
      body.otp?.trim();

    if (!email || !otp) {
      return NextResponse.json(
        {
          message:
            "Thiếu email hoặc mã xác thực.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: profile,
      error:
        profileError,
    } = await adminClient
      .from("profiles")
      .select(`
        id,
        email,
        role,
        is_active,
        deleted_at
      `)
      .ilike("email", email)
      .eq("role", UserRole.STUDENT)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      return NextResponse.json(
        {
          message:
            "Không tìm thấy tài khoản.",
        },
        {
          status: 404,
        }
      );
    }

    // Lấy OTP mới nhất
    const {
      data: resetCode,
      error:
        resetCodeError,
    } = await adminClient
      .from("password_reset_codes")
      .select("*")
      .eq(
        "student_id",
        profile.id
      )
      .eq("used", false)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (resetCodeError) {
      throw resetCodeError;
    }

    if (!resetCode) {
      return NextResponse.json(
        {
          message:
            "Mã xác thực không tồn tại hoặc đã được sử dụng.",
        },
        {
          status: 400,
        }
      );
    }

    // Kiểm tra hết hạn
    if (
      new Date(resetCode.expires_at)
        .getTime() <
      Date.now()
    ) {
      return NextResponse.json(
        {
          message:
            "Mã xác thực đã hết hạn.",
        },
        {
          status: 400,
        }
      );
    }

    // Kiểm tra OTP
    const valid =
      await verifyOtp(
        otp,
        resetCode.otp_hash
      );

const resetToken =
  crypto
    .randomBytes(32)
    .toString("hex");

const resetTokenHash =
  crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

const resetTokenExpiresAt =
  new Date(
    Date.now() + 10 * 60 * 1000
  ).toISOString();

  const {
  error: updateError,
} = await adminClient
  .from("password_reset_codes")
  .update({
    reset_token_hash:
      resetTokenHash,

    reset_token_expires_at:
      resetTokenExpiresAt,

    used: true,
  })
  .eq("id", resetCode.id);

if (updateError) {
  throw updateError;
}

    if (!valid) {
      return NextResponse.json(
        {
          message:
            "Mã xác thực không đúng.",
        },
        {
          status: 400,
        }
      );
    }

    // OTP đúng
    // Bước 8 sẽ xử lý reset token

    return NextResponse.json({
      success: true,
      message:
        "Xác thực thành công.",
    });

  } catch (error) {
    console.error(
      "[VERIFY OTP ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Không thể xác thực mã.",
      },
      {
        status: 500,
      }
    );
  }
}