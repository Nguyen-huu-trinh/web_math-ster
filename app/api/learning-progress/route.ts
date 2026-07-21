import { NextRequest, NextResponse } from "next/server";

import { learningProgressService } from "@/services/learning-progress.service";

import { UpdateLearningProgressSchema } from "@/validators/learning-progress.schema";

export async function GET(request: NextRequest) {

    const studentId =
        request.nextUrl.searchParams.get("studentId");

    if (!studentId) {

        return NextResponse.json(
            {
                message: "studentId is required",
            },
            {
                status: 400,
            }
        );
    }

    return NextResponse.json(
        await learningProgressService.getStudentProgress(
            studentId
        )
    );
}

export async function POST(request: NextRequest) {

    const body = await request.json();

    const values =
        UpdateLearningProgressSchema.parse(body);

    return NextResponse.json(
        await learningProgressService.save(values)
    );
}