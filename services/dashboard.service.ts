import { dashboardRepository } from "@/repositories/dashboard.repository";

// Simple TTL Cache để giảm tải CPU & Database Query
interface CacheItem<T> {
  data: T;
  expiry: number;
}

export class DashboardService {
  private studentCache = new Map<string, CacheItem<any>>();
  private teacherCache: CacheItem<any> | null = null;
  private readonly TTL_MS = 60 * 1000; // Cache 60 giây ở tầng Memory

  async studentDashboard(studentId: string) {
    const now = Date.now();
    const cached = this.studentCache.get(studentId);

    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const data = await dashboardRepository.getStudentDashboard(studentId);

    // Lưu cache ngắn hạn
    this.studentCache.set(studentId, {
      data,
      expiry: now + this.TTL_MS,
    });

    return data;
  }

  async teacherDashboard() {
    const now = Date.now();

    if (this.teacherCache && this.teacherCache.expiry > now) {
      return this.teacherCache.data;
    }

    const data = await dashboardRepository.getTeacherDashboard();

    this.teacherCache = {
      data,
      expiry: now + this.TTL_MS,
    };

    return data;
  }

  // Hàm xóa cache khi học sinh nộp bài hoặc có dữ liệu mới
  clearStudentCache(studentId: string) {
    this.studentCache.delete(studentId);
  }
}

export const dashboardService = new DashboardService();