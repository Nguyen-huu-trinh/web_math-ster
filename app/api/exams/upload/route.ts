import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request
) {
  const supabase = await createClient();

  const formData =
    await request.formData();

  const file = formData.get(
    "file"
  ) as File;

  if (!file) {
    return NextResponse.json(
      {
        message: "No file",
      },
      {
        status: 400,
      }
    );
  }

  const filename = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("exam-files")
    .upload(filename, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("exam-files")
    .getPublicUrl(filename);

  return NextResponse.json({
    url: data.publicUrl,
  });
}