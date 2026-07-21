import { NextResponse } from "next/server";
import { examService } from "@/services/exam.service";

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

    const exam =
      await examService.duplicate(id);

    return NextResponse.json(exam);
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