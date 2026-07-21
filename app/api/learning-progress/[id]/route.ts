import { NextResponse } from "next/server";

import { learningProgressService } from "@/services/learning-progress.service";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(
    request: Request,
    { params }: Props
) {

    const { id } = await params;

    return NextResponse.json(
        await learningProgressService.complete(id)
    );
}