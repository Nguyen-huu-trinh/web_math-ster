import { dashboardRepository } from "@/repositories/dashboard.repository";

export class DashboardService {
  async studentDashboard(studentId: string) {
    return await dashboardRepository.getStudentDashboard(
      studentId
    );
  }

  async teacherDashboard() {
    return await dashboardRepository.getTeacherDashboard();
  }
}

export const dashboardService =
  new DashboardService();