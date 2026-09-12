import { NextRequest } from "next/server";

import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";
import { announcementService } from "@/services/announcement.service";

export async function GET() {
  try {
    const data = await announcementService.get();
    const response = success(data);

    // Thông báo chung có thể cache public 1 giờ (3600s)
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=300"
    );

    return response;
  } catch (error) {
    console.error("GET ANNOUNCEMENT ERROR:", error);
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

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