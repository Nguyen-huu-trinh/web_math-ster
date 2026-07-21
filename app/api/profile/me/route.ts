import { NextResponse } from "next/server";
import { profileService } from "@/services/profile.service";

export async function GET() {
  try {
    const profile = await profileService.getCurrentProfile();

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}