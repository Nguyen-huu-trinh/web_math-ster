import { dashboardRepository } from "@/repositories/dashboard.repository";

export class DashboardService {
  async studentDashboard(studentId: string) {
    // Trực tiếp truy xuất repository chuẩn hóa
    return await dashboardRepository.getStudentDashboard(studentId);
  }

  async teacherDashboard() {
    return await dashboardRepository.getTeacherDashboard();
  }

  clearStudentCache(studentId: string) {
    // Không cần xử lý cache map thủ công ở RAM Serverless
  }
}

export const dashboardService = new DashboardService();