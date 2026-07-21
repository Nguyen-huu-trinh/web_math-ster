import { NextRequest } from "next/server";

import { teacherService } from "@/services/teacher.service";

import {
  CreateTeacherSchema,
} from "@/validators/teacher.schema";

import { requireAdmin } from "@/lib/auth/admin";

import {
  success,
  created,
} from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    await requireAdmin();

    return success(
      await teacherService.getAll()
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    await requireAdmin();

    const body = await request.json();

    const values =
      CreateTeacherSchema.parse(body);

    return created(
      await teacherService.create(values)
    );
  } catch (error) {
    return handleError(error);
  }
}