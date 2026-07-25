import { apiClient } from "@/lib/api/client";

export interface StudentDashboard {

    profile: {
        full_name: string;
    };

    totalCourses: number;

    completedLessons: number;

    totalLessons: number;

    totalAttempts: number;

    averageScore: number;
}
export interface TeacherDashboard {

  totalCourses: number;

  totalLessons: number;

  totalStudents: number;

  totalExams: number;

}
export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  change: number;
}

export interface DashboardLeaderboard {
  overall: LeaderboardEntry[];
  latest: LeaderboardEntry[];
}

class DashboardClientService {
  getStudentDashboard() {
    return apiClient.get<StudentDashboard>(
      "/api/dashboard/student"
    );
  }
getTeacherDashboard() {
  return apiClient.get<TeacherDashboard>(
    "/api/dashboard/teacher"
  );
}
  async getLeaderboard(): Promise<DashboardLeaderboard> {
    const data = await apiClient.get<any>(
      "/api/dashboard/leaderboard"
    );

    return {
      overall: data.overall.map(
        (item: any, index: number) => ({
          rank: index + 1,
          name: item.full_name,
          score: Number(item.average_score),
          change: 0,
        })
      ),

      latest: data.latest.map(
        (item: any) => ({
          rank: item.ranking,
          name: item.full_name,
          score: Number(item.score),
          change: 0,
        })
      ),
    };
  }
}

export const dashboardClientService =
  new DashboardClientService();