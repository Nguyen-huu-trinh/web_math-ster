import { NextResponse } from "next/server";
import { courseService } from "@/services/course.service";

export async function GET() {
  try {
    const data = await courseService.getAll();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: String(err),
      },
      {
        status: 500,
      }
    );
  }
}