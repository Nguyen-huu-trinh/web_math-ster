import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";
import { dashboardLeaderboardService } from "@/services/dashboard-leaderboard.service";

// Bật ISR Cache ở cấp độ Route (Cache tại Vercel Edge 5 phút)
export const revalidate = 300;

export async function GET() {
  try {
    const data = await dashboardLeaderboardService.dashboard();

    const response = success(data);

    // Bật cache public trên Edge CDN thay vì private
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    return handleError(error);
  }
}