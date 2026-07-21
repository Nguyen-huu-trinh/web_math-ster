import { NextResponse } from "next/server";
import { questionService } from "@/services/question.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const question =
      await questionService.restore(id);

    return NextResponse.json(question);
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