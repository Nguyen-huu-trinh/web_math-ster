import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";
import { dashboardRepository } from "@/repositories/dashboard.repository";

export async function GET() {
  try {
    const data = await dashboardRepository.getActiveStudentCount();

    const response = success(data);

    // Cache 3 phút (180s) tại trình duyệt, revalidate sau 60s
    response.headers.set(
      "Cache-Control",
      "private, max-age=3000, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    return handleError(error);
  }
}