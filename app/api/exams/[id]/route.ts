import { NextResponse } from "next/server";
import { examService } from "@/services/exam.service";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const exam = await examService.getById(id);

    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const body = await request.json();

    const { id } = await params;

    const exam = await examService.update(id, body);

    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    await examService.remove(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}