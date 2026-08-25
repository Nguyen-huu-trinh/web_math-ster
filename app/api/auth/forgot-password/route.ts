import { NextResponse } from "next/server";

import {
  sendPasswordResetEmail,
} from "@/lib/email/send-password-reset-email";

import { adminClient } from "@/lib/supabase/admin";

import { UserRole } from "@/lib/auth/roles";

import { hashOtp } from "@/lib/auth/password-reset";

function generateOtp() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const email =
      body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          message:
            "Vui lòng nhập tài khoản.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "[FORGOT PASSWORD] INPUT:",
      email
    );

    // =====================================================
    // TÌM HỌC SINH
    // =====================================================

    const {
      data: profile,
      error,
    } = await adminClient
      .from("profiles")
      .select(`
        id,
        email,
        personal_email,
        role,
        is_active,
        deleted_at
      `)
      .ilike("email", email)
      .eq("role", UserRole.STUDENT)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();

    console.log(
      "[FORGOT PASSWORD] PROFILE:",
      profile
    );

    console.log(
      "[FORGOT PASSWORD] ERROR:",
      error
    );

    if (error) {
      return NextResponse.json(
        {
          message:
            "Có lỗi xảy ra khi tìm tài khoản.",
        },
        {
          status: 500,
        }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          message:
            "Không tìm thấy tài khoản học sinh.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // KIỂM TRA EMAIL CÁ NHÂN
    // =====================================================

    if (!profile.personal_email) {
      return NextResponse.json(
        {
          message:
            "Tài khoản chưa có email cá nhân để khôi phục mật khẩu.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // TẠO OTP
    // =====================================================

    const otp = generateOtp();

    const otpHash =
      await hashOtp(otp);

    const expiresAt =
      new Date(
        Date.now() +
          5 * 60 * 1000
      ).toISOString();

    // =====================================================
    // LƯU OTP
    // =====================================================

    const {
      error: insertError,
    } = await adminClient
      .from("password_reset_codes")
      .insert({
        student_id: profile.id,
        email: profile.email,
        code_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
      });

    if (insertError) {
      console.error(
        "[FORGOT PASSWORD] INSERT OTP ERROR:",
        insertError
      );

      return NextResponse.json(
        {
          message:
            "Không thể tạo mã xác thực.",
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // GỬI OTP TỚI EMAIL CÁ NHÂN
    // =====================================================

    await sendPasswordResetEmail({
      email: profile.personal_email,
      otp,
    });

    console.log(
      "[FORGOT PASSWORD] OTP SENT:",
      profile.personal_email
    );

    return NextResponse.json({
      success: true,
      message:
        "Mã xác thực đã được gửi đến email cá nhân.",
    });

  } catch (error) {
    console.error(
      "[FORGOT PASSWORD] ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}