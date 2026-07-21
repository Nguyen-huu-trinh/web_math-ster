import { NextRequest } from "next/server";

import { adminService } from "@/services/admin.service";

import {
  UpdateAdminSchema,
} from "@/validators/admin.schema";

import {
  success,
} from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

import { requireAdmin } from "@/lib/auth/admin";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    await requireAdmin();

    const { id } =
      await params;

    return success(
      await adminService.getById(id)
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  try {
    await requireAdmin();

    const body =
      await request.json();

    const values =
      UpdateAdminSchema.parse(body);

    const { id } =
      await params;

    return success(
      await adminService.update(
        id,
        values
      )
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  try {
    await requireAdmin();

    const { id } =
      await params;

    return success(
      await adminService.delete(id)
    );
  } catch (error) {
    return handleError(error);
  }
}