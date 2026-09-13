import { createClient } from "@/lib/supabase/server";

export class DashboardRepository {
  async getStudentDashboard(studentId: string) {
    const supabase = await createClient();

    // 1. Chạy tất cả các query độc lập song song
    const [profileRes, coursesRes, completedLessonsRes, totalLessonsRes, pendingExamsRes, scoresRes] =
      await Promise.all([
        // Profile
        supabase
          .from("profiles")
          .select("full_name, learning_goal")
          .eq("id", studentId)
          .single(),

        // Tổng số khóa học đã đăng ký
        supabase
          .from("course_students")
          .select("course_id", { count: "exact", head: true })
          .eq("student_id", studentId),

        // Số bài học đã hoàn thành
        supabase
          .from("student_lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("student_id", studentId)
          .eq("is_completed", true),

        // Tổng số bài học trong các khóa học học sinh đã đăng ký
        supabase
          .from("course_students")
          .select("course_id")
          .eq("student_id", studentId),

        // Đề thi chưa làm/chưa nộp
        supabase
          .from("exam_attempts")
          .select("id", { count: "exact", head: true })
          .eq("student_id", studentId)
          .is("submitted_at", null),

        // Điểm trung bình định kỳ
        supabase
          .from("exam_attempts")
          .select("score, exams!inner(category)")
          .eq("student_id", studentId)
          .eq("exams.category", "PERIODIC")
          .not("score", "is", null),
      ]);

    if (profileRes.error) throw profileRes.error;

    // Tính tổng bài học thuộc các khóa đã đăng ký
    let totalLessonsCount = 0;
    const enrolledCourseIds = coursesRes.data ? coursesRes.data.map((c) => c.course_id) : [];

    if (enrolledCourseIds.length > 0) {
      const { count } = await supabase
        .from("lessons")
        .select("id", { count: "exact", head: true })
        .in("course_id", enrolledCourseIds);
      totalLessonsCount = count ?? 0;
    }

    // Tính điểm trung bình định kỳ
    const scores = scoresRes.data ?? [];
    const avgScore =
      scores.length > 0
        ? scores.reduce((sum, item) => sum + Number(item.score ?? 0), 0) / scores.length
        : 0;

    return {
      profile: {
        full_name: profileRes.data.full_name,
        learning_goal: profileRes.data.learning_goal ?? null,
      },
      totalCourses: coursesRes.count ?? 0,
      completedLessons: completedLessonsRes.count ?? 0,
      totalLessons: totalLessonsCount,
      pendingExams: pendingExamsRes.count ?? 0,
      averagePeriodicScore: Number(avgScore.toFixed(2)),
    };
  }

  async getTeacherDashboard() {
    const supabase = await createClient();

    // Tải song song thông tin thống kê cho Teacher Dashboard
    const [courses, lessons, students, exams] = await Promise.all([
      supabase.from("courses").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("lessons").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "STUDENT"),
      supabase.from("exams").select("id", { count: "exact", head: true }).is("deleted_at", null),
    ]);

    return {
      totalCourses: courses.count ?? 0,
      totalLessons: lessons.count ?? 0,
      totalStudents: students.count ?? 0,
      totalExams: exams.count ?? 0,
    };
  }

  async getActiveStudentCount() {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "STUDENT")
      .eq("is_active", true);

    if (error) throw error;

    return {
      activeStudents: count ?? 0,
    };
  }

  async lazyStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_lazy_students").select("id, full_name, email, avatar_url").limit(5);
    if (error) throw error;
    return data;
  }

  async lowHomeworkStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_low_homework_students").select("id, full_name, email, avatar_url").limit(5);
    if (error) throw error;
    return data;
  }

  async hardworkingStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_hardworking_students").select("id, full_name, email, avatar_url").limit(5);
    if (error) throw error;
    return data;
  }

  async excellentStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_excellent_students").select("id, full_name, email, avatar_url").limit(8);
    if (error) throw error;
    return data;
  }
}

export const dashboardRepository = new DashboardRepository();