import {
  NextRequest,
  NextResponse,
} from "next/server";

import { examService } from "@/services/exam.service";
import { requireTeacher } from "@/lib/auth/teacher";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  const key =
    await examService.getAnswerKey(id);

  return NextResponse.json(key);
}

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  await requireTeacher();

  const { id } = await params;

  const answerKey =
    await request.json();

  const exam =
    await examService.updateAnswerKey(
      id,
      answerKey
    );

  return NextResponse.json(exam);
}