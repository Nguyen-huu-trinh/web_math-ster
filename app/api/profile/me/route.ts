import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileServerService } from "@/services/profile-server.service";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile =
  await profileServerService.getCurrentProfile(
    user.id
  );

    return NextResponse.json(profile);
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        message: e.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const profile =
      await profileServerService.update(user.id, body);

    return NextResponse.json(profile);
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        message: e.message,
      },
      {
        status: 500,
      }
    );
  }
}