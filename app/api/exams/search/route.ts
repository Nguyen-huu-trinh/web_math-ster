import { NextRequest, NextResponse } from "next/server";
import { examService } from "@/services/exam.service";

export async function GET(
  request: NextRequest
) {
  try {
    const keyword =
      request.nextUrl.searchParams.get("q") ?? "";

    const exams =
      await examService.search(keyword);

    return NextResponse.json(exams);
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