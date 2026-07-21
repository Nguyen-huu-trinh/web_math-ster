import { NextRequest } from "next/server";

import { adminService } from "@/services/admin.service";

import {
  CreateAdminSchema,
} from "@/validators/admin.schema";

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
      await adminService.getAll()
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

    const body =
      await request.json();

    const data =
      CreateAdminSchema.parse(body);

    return created(
      await adminService.create(data)
    );
  } catch (error) {
    return handleError(error);
  }
}