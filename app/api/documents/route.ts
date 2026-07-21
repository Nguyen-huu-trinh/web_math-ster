import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/services/document.service";
import { CreateDocumentSchema } from "@/validators/document.schema";

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
        message:
          "lessonId is required",
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json(
    await documentService.getByLesson(
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
    CreateDocumentSchema.parse(
      body
    );

  return NextResponse.json(
    await documentService.create(
      values
    ),
    {
      status: 201,
    }
  );
}