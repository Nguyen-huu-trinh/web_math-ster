import { NextRequest } from "next/server";

import { storageService } from "@/lib/supabase/storage";

import { requireTeacher } from "@/lib/auth/teacher";

import { success } from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

export async function DELETE(
  request: NextRequest
) {
  try {
    await requireTeacher();

    const body =
      await request.json();

    await storageService.remove(
      body.bucket,
      body.path
    );

    return success();
  } catch (error) {
    return handleError(error);
  }
}