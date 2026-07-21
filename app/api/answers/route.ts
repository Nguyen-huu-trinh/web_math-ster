import { NextRequest, NextResponse } from "next/server";
import { answerService } from "@/services/answer.service";
import { CreateAnswerSchema } from "@/validators/answer.schema";

export async function GET(
  request: NextRequest
) {
  const questionId =
    request.nextUrl.searchParams.get(
      "questionId"
    );

  if (!questionId) {
    return NextResponse.json(
      {
        message: "questionId is required",
      },
      {
        status: 400,
      }
    );
  }

  const answers =
    await answerService.getByQuestion(
      questionId
    );

  return NextResponse.json(answers);
}

export async function POST(
  request: NextRequest
) {
  const body = await request.json();

  const values =
    CreateAnswerSchema.parse(body);

  const answer =
    await answerService.create(values);

  return NextResponse.json(answer, {
    status: 201,
  });
}