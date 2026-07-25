import { NextRequest, NextResponse } from "next/server";

import { profileService } from "@/services/profile.service";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const profile =
      await profileService.getCurrentProfile();

    return NextResponse.json(profile);
  } catch (error) {
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

export async function PATCH(
  request: NextRequest
) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const profile =
      await profileService.update(
        user.id,
        {
          full_name:
            body.full_name,

          phone:
            body.phone,

          avatar_url:
            body.avatar_url,
        }
      );

    return NextResponse.json(profile);

  } catch (error) {

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