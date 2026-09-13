import { leaderboardRepository } from "@/repositories/leaderboard.repository";

export class DashboardLeaderboardService {
  private cache: any = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 5 phút

  async dashboard() {
    const now = Date.now();

    // 1. Trả về In-Memory Cache ngay lập tức nếu chưa hết hạn 5 phút (0ms Active CPU)
    if (this.cache && now - this.lastFetchTime < this.CACHE_TTL) {
      return this.cache;
    }

    // 2. Gọi hàm repository gom nhóm truy vấn
    const data = await leaderboardRepository.getDashboardData();

    this.cache = data;
    this.lastFetchTime = now;

    return this.cache;
  }
}

export const dashboardLeaderboardService = new DashboardLeaderboardService();