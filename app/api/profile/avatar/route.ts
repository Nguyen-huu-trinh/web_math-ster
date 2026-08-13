import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request
) {
  try {
    const profile =
      await requireStudent();

    const body =
      await request.json();

    const avatarUrl =
      body.avatar_url?.trim();

    if (!avatarUrl) {
      return NextResponse.json(
        {
          message:
            "Link avatar không được để trống.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Chỉ cho phép Google Drive
     */
    if (
      !avatarUrl.includes(
        "drive.google.com"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Avatar phải là link Google Drive.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      await createClient();

    const {
      error,
    } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
      })
      .eq("id", profile.id);

    if (error) {
      console.error(
        "[PROFILE AVATAR UPDATE]",
        error
      );

      throw error;
    }

    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
    });

  } catch (error) {
    console.error(
      "[PROFILE AVATAR ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật avatar.",
      },
      {
        status: 500,
      }
    );
  }
}