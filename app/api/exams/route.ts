import { NextResponse } from "next/server";
import { examService } from "@/services/exam.service";

export async function GET() {
  try {
    const exams = await examService.getAll();

    return NextResponse.json(exams);
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const exam = await examService.create(body);

    return NextResponse.json(exam);
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