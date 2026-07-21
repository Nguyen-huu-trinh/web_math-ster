import { NextRequest } from "next/server";

import { storageService } from "@/lib/supabase/storage";

import { requireTeacher } from "@/lib/auth/teacher";

import { success } from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

export async function POST(
  request: NextRequest
) {
  try {
    await requireTeacher();

    const formData =
      await request.formData();

    const file =
      formData.get("file") as File;

    const bucket =
      (formData.get("bucket") as string) ??
      "documents";

    if (!file) {
      throw new Error("Missing file");
    }

    const extension =
      file.name.split(".").pop();

    const filename =
      `${crypto.randomUUID()}.${extension}`;

    const path =
      `${Date.now()}/${filename}`;

    await storageService.upload(
      bucket,
      path,
      file
    );

    const url =
      await storageService.getPublicUrl(
        bucket,
        path
      );

    return success({
      bucket,
      path,
      url,
      filename,
      size: file.size,
    });
  } catch (error) {
    return handleError(error);
  }
}