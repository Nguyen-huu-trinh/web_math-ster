import { createClient } from "@/lib/supabase/server";

export class DashboardRepository {
  async getStudentDashboard(studentId: string) {

    const supabase =
        await createClient();

    const {
        data,
        error,
    } = await supabase.rpc(
        "get_student_dashboard",
        {
            p_student_id: studentId,
        }
    );

    if (error) throw error;

    const row = data?.[0];

    return {
        profile: {
            full_name: row.full_name,
        },

        totalCourses:
            Number(row.total_courses),

        completedLessons:
            Number(row.completed_lessons),

        totalLessons:
            Number(row.total_lessons),

        totalExams:
            Number(row.total_exams),

        averagePeriodicScore:
            Number(
                row.average_periodic_score ?? 0
            ),
    };

}

  async getTeacherDashboard() {
    const supabase = await createClient();

    const [
      courses,
      lessons,
      students,
      exams,
    ] = await Promise.all([
      supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null),

      supabase
        .from("lessons")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null),

      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "STUDENT")
        .eq("is_active", true),

      supabase
        .from("exams")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null),
    ]);

    return {
      totalCourses:
        courses.count ?? 0,

      totalLessons:
        lessons.count ?? 0,

      totalStudents:
        students.count ?? 0,

      totalExams:
        exams.count ?? 0,
    };
  }
}

export const dashboardRepository =
  new DashboardRepository();
