import { NextResponse } from "next/server";

import { examService } from "@/services/exam.service";
import { requireTeacher } from "@/lib/auth/teacher";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: Props
) {

  await requireTeacher();

  const { id } = await params;

  const exam =
    await examService.activate(id);

  return NextResponse.json(exam);
}