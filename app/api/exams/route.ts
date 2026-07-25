import { NextRequest, NextResponse } from "next/server";

import { examService } from "@/services/exam.service";

import { requireTeacher } from "@/lib/auth/teacher";

export async function GET() {

    await requireTeacher();

    const exams =
        await examService.getAll();

    return NextResponse.json(exams);
}

export async function POST(
    request: NextRequest
) {

    const teacher =
        await requireTeacher();

    const body =
        await request.json();

    const exam =
        await examService.create(
            teacher.id,
            body
        );

    return NextResponse.json(exam);
}