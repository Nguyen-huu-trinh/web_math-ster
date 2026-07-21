import { NextRequest, NextResponse } from "next/server";
import { questionService } from "@/services/question.service";
import { CreateQuestionSchema } from "@/validators/question.schema";

export async function GET(request: NextRequest) {
  try {
    const examId =
      request.nextUrl.searchParams.get("examId");

    if (!examId) {
      return NextResponse.json(
        {
          message: "examId is required",
        },
        {
          status: 400,
        }
      );
    }

    const questions =
      await questionService.getByExam(examId);

    return NextResponse.json(questions);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const values =
      CreateQuestionSchema.parse(body);

    const question =
      await questionService.create(values);

    return NextResponse.json(question, {
      status: 201,
    });
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