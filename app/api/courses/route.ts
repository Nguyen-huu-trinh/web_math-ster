import { NextRequest, NextResponse } from "next/server";
import { courseService } from "@/services/course.service";
import { CreateCourseSchema } from "@/validators/course.schema";

export async function GET() {
  return NextResponse.json(
    await courseService.getAll()
  );
}

export async function POST(
  request: NextRequest
) {
  const body = await request.json();

  const values =
    CreateCourseSchema.parse(body);

  return NextResponse.json(
    await courseService.create(values),
    {
      status: 201,
    }
  );
}