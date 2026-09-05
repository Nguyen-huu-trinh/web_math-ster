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

    const zoomLink =
      body.link_zoom?.trim();

    if (!zoomLink) {
      return NextResponse.json(
        {
          message:
            "Link Zoom không được để trống.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Kiểm tra link Zoom
     */
    try {
      const url = new URL(zoomLink);

      if (
        url.protocol !== "https:" ||
        !url.hostname.includes("zoom.us")
      ) {
        return NextResponse.json(
          {
            message:
              "Vui lòng nhập đường link Zoom hợp lệ.",
          },
          {
            status: 400,
          }
        );
      }
    } catch {
      return NextResponse.json(
        {
          message:
            "Vui lòng nhập đường link Zoom hợp lệ.",
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
        link_zoom: zoomLink,
      })
      .eq("id", profile.id);

    if (error) {
      console.error(
        "[PROFILE ZOOM UPDATE]",
        error
      );

      throw error;
    }

    return NextResponse.json({
      success: true,
      link_zoom: zoomLink,
    });

  } catch (error) {
    console.error(
      "[PROFILE ZOOM ERROR]",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật link Zoom.",
      },
      {
        status: 500,
      }
    );
  }
}