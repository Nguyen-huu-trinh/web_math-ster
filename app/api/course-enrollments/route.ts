import { NextRequest, NextResponse } from "next/server";
import { courseEnrollmentService } from "@/services/course-enrollment.service";
import { CreateCourseEnrollmentSchema } from "@/validators/course-enrollment.schema";

export async function GET(
  request: NextRequest
) {
  const courseId =
    request.nextUrl.searchParams.get("courseId");

  const studentId =
    request.nextUrl.searchParams.get("studentId");

  if (courseId) {
    return NextResponse.json(
      await courseEnrollmentService.getStudents(
        courseId
      )
    );
  }

  if (studentId) {
    return NextResponse.json(
      await courseEnrollmentService.getCourses(
        studentId
      )
    );
  }

  return NextResponse.json(
    {
      message:
        "courseId or studentId is required",
    },
    {
      status: 400,
    }
  );
}

export async function POST(
  request: NextRequest
) {
  const body = await request.json();

  const values =
    CreateCourseEnrollmentSchema.parse(body);

  return NextResponse.json(
    await courseEnrollmentService.enroll(values),
    {
      status: 201,
    }
  );
}