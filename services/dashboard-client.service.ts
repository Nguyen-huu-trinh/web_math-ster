import { apiClient } from "@/lib/api/client";

export interface StudentDashboard {
  profile: {
    full_name: string;
  };

  totalCourses: number;

  completedLessons: number;

  totalLessons: number;

  pendingExams:number;

  averagePeriodicScore: number;
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

export interface LeaderboardStudent {
  student_id: string;

  student_code: string;

  full_name: string;

  count: number;
}

export interface DashboardLeaderboard {
  overall: LeaderboardEntry[];

  latest: LeaderboardEntry[];

  lazy: LeaderboardStudent[];

  lowHomework: LeaderboardStudent[];

  hardworking: LeaderboardStudent[];

  excellent: LeaderboardStudent[];
}

class DashboardClientService {
  async getStudentDashboard(): Promise<StudentDashboard> {
  return apiClient.get<StudentDashboard>(
    "/api/dashboard/student"
  );
}

  async getTeacherDashboard(): Promise<TeacherDashboard> {
  return apiClient.get<TeacherDashboard>(
    "/api/dashboard/teacher"
  );
}

  async getLeaderboard(): Promise<DashboardLeaderboard> {

    const response = await apiClient.get<any>(
  "/api/dashboard/leaderboard"
);

const data = response.data;

    return {

      // ===== Leaderboard cũ =====

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

      // ===== Leaderboard mới =====

      lazy: data.lazy.map((item: any) => ({
        student_id: item.student_id,
        student_code: item.student_code,
        full_name: item.full_name,
        count: Number(item.count),
      })),

      lowHomework: data.lowHomework.map((item: any) => ({
        student_id: item.student_id,
        student_code: item.student_code,
        full_name: item.full_name,
        count: Number(item.count),
      })),

      hardworking: data.hardworking.map((item: any) => ({
        student_id: item.student_id,
        student_code: item.student_code,
        full_name: item.full_name,
        count: Number(item.count),
      })),

      excellent: data.excellent.map((item: any) => ({
        student_id: item.student_id,
        student_code: item.student_code,
        full_name: item.full_name,
        count: Number(item.count),
      })),

    };
  }
}

export const dashboardClientService =
  new DashboardClientService();