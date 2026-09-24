import { createClient } from "@/lib/supabase/server";

export class DashboardRepository {
  async getStudentDashboard(studentId: string) {
    const supabase = await createClient();

    // Chạy song song query dashboard và query xếp hạng
    const [dashboardRes, rankingRes] = await Promise.all([
      supabase
        .from("v_student_dashboard")
        .select(`
          full_name,
          learning_goal,
          total_courses,
          completed_lessons,
          total_lessons,
          pending_exams,
          average_periodic_score
        `)
        .eq("student_id", studentId)
        .single(),

      supabase
        .from("v_student_rankings")
        .select("current_rank, total_students, top_percent")
        .eq("student_id", studentId)
        .maybeSingle(),
    ]);

    if (dashboardRes.error) throw dashboardRes.error;

    const data = dashboardRes.data;
    const rankInfo = rankingRes.data;

    return {
      profile: {
        full_name: data.full_name,
        learning_goal: data.learning_goal ?? null,
      },
      totalCourses: Number(data.total_courses ?? 0),
      completedLessons: Number(data.completed_lessons ?? 0),
      totalLessons: Number(data.total_lessons ?? 0),
      pendingExams: Number(data.pending_exams ?? 0),
      averagePeriodicScore: Number(data.average_periodic_score ?? 0),
      // Bổ sung dữ liệu xếp hạng
      ranking: {
        rank: Number(rankInfo?.current_rank ?? 1),
        totalStudents: Number(rankInfo?.total_students ?? 1),
        topPercent: Number(rankInfo?.top_percent ?? 100),
      },
    };
  }

  async getTeacherDashboard() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("v_teacher_dashboard")
      .select("total_courses, total_lessons, total_students, total_exams")
      .single();

    if (error) throw error;

    return {
      totalCourses: Number(data.total_courses ?? 0),
      totalLessons: Number(data.total_lessons ?? 0),
      totalStudents: Number(data.total_students ?? 0),
      totalExams: Number(data.total_exams ?? 0),
    };
  }

  async getActiveStudentCount() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("v_active_student_count")
      .select("active_students")
      .single();

    if (error) throw error;

    return {
      activeStudents: Number(data?.active_students ?? 0),
    };
  }

  async lazyStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_lazy_students").select("*").limit(5);
    if (error) throw error;
    return data;
  }

  async lowHomeworkStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_low_homework_students").select("*").limit(5);
    if (error) throw error;
    return data;
  }

  async hardworkingStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_hardworking_students").select("*").limit(5);
    if (error) throw error;
    return data;
  }

  async excellentStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_excellent_students").select("*").limit(8);
    if (error) throw error;
    return data;
  }
}

export const dashboardRepository = new DashboardRepository();