import { NextResponse } from "next/server";
import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";
import { dashboardLeaderboardService } from "@/services/dashboard-leaderboard.service";

export async function GET() {
  try {
    const data = await dashboardLeaderboardService.dashboard();

    // Lấy NextResponse từ helper success và bổ sung Cache Header
    const response = success(data);

    // Cache 5 phút (300s) tại trình duyệt người dùng, stale-while-revalidate 60s
    response.headers.set(
      "Cache-Control",
      "private, max-age=1800, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    return handleError(error);
  }
}