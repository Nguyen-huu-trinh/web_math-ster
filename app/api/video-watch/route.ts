import { NextRequest, NextResponse } from "next/server";

import { videoWatchService } from "@/services/video-watch.service";

import { UpdateVideoWatchSchema } from "@/validators/video-watch.schema";

export async function GET(request: NextRequest) {
  const studentId =
    request.nextUrl.searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      {
        message: "studentId is required",
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json(
    await videoWatchService.getStudentVideos(
      studentId
    )
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const values =
    UpdateVideoWatchSchema.parse(body);

  return NextResponse.json(
    await videoWatchService.save(values)
  );
}