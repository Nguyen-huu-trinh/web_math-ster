import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";
import { dashboardRepository } from "@/repositories/dashboard.repository";

// Cấu hình revalidate ở cấp độ Route của Next.js (Cache ở Edge CDN trong 5 phút)
export const revalidate = 300; 

export async function GET() {
  try {
    const data = await dashboardRepository.getActiveStudentCount();

    const response = success(data);

    // Cache tại CDN Vercel trong 300s (5 phút), stale-while-revalidate 600s
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    return handleError(error);
  }
}