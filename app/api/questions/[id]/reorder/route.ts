import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { questionService } from "@/services/question.service";

const ReorderSchema = z.object({
  question_no: z.number().int().positive(),
});

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  try {
    const body = await request.json();

    const values =
      ReorderSchema.parse(body);

    const { id } = await params;

    const question =
      await questionService.reorder(
        id,
        values.question_no
      );

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