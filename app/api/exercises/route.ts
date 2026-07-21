import { NextRequest, NextResponse } from "next/server";
import { exerciseService } from "@/services/exercise.service";
import { CreateExerciseSchema } from "@/validators/exercise.schema";

export async function GET(
  request: NextRequest
) {
  const lessonId =
    request.nextUrl.searchParams.get(
      "lessonId"
    );

  if (!lessonId) {
    return NextResponse.json(
      {
        message: "lessonId is required",
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json(
    await exerciseService.getByLesson(
      lessonId
    )
  );
}

export async function POST(
  request: NextRequest
) {
  const body =
    await request.json();

  const values =
    CreateExerciseSchema.parse(body);

  return NextResponse.json(
    await exerciseService.create(values),
    {
      status: 201,
    }
  );
}