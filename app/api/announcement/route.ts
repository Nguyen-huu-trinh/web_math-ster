import { NextRequest } from "next/server";
import { z } from "zod";
import { requireTeacher } from "@/lib/auth/teacher";

import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";
import { announcementService } from "@/services/announcement.service";

export async function GET() {
  try {
    const data = await announcementService.get();
    const response = success(data);

    // Fetch the latest announcement when students follow a broadcast.
    response.headers.set(
      "Cache-Control",
      "no-store"
    );

    return response;
  } catch (error) {
    console.error("GET ANNOUNCEMENT ERROR:", error);
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireTeacher();
    const body = z.object({
      id: z.string().uuid(),
      title: z.string().refine((value) => value.trim().length > 0),
      content: z.string().nullable().optional().transform((value) => value ?? ""),
    }).parse(await request.json());

    await announcementService.update(
      body.id,
      body.title,
      body.content
    );

    return success({
      message: "Announcement updated",
    });
  } catch (error) {
    return handleError(error);
  }
}
