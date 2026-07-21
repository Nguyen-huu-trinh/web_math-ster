import { NextRequest, NextResponse } from "next/server";
import { attemptService } from "@/services/attempt.service";
import { StartAttemptSchema } from "@/validators/attempt.schema";

export async function POST(
  request: NextRequest
) {
  const body = await request.json();

  const values =
    StartAttemptSchema.parse(body);

  const attempt =
    await attemptService.start(values);

  return NextResponse.json(attempt, {
    status: 201,
  });
}