import { NextRequest, NextResponse } from "next/server";
import { courseDetailService } from "@/services/course-detail.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  const studentId =
    request.nextUrl.searchParams.get(
      "studentId"
    ) ?? undefined;

  return NextResponse.json(
    await courseDetailService.getCourseDetail(
      id,
      studentId
    )
  );
}