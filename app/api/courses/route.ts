import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const course = await courseService.create(body);

    return NextResponse.json(course, {
      status: 201,
    });
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