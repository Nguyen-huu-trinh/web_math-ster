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

  const data = await courseDetailService.getCourseDetail(
    id,
    studentId
  );

  return NextResponse.json(data, {
    headers: {
      // Lưu cache 30 phút (1800s) tại trình duyệt của riêng học sinh này
      "Cache-Control": "private, max-age=1800, stale-while-revalidate=60",
    },
  });
}