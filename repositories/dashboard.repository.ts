import { createClient } from "@/lib/supabase/server";

export class DashboardRepository {
  async getStudentDashboard(studentId: string) {
    const supabase = await createClient();

    const [
      profile,
      courses,
      progress,
      lessons,
      attempts,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", studentId)
        .single(),

      supabase
        .from("course_students")
        .select("course_id")
        .eq("student_id", studentId),

      supabase
        .from("lesson_progress")
        .select("is_completed")
        .eq("student_id", studentId),

      supabase
        .from("lessons")
        .select("id"),

      supabase
        .from("exam_attempts")
        .select(`
          exam_id,
          score,
          exams!inner(
            id,
            category
          )
        `)
        .eq("student_id", studentId),
    ]);

    const completedLessons =
      progress.data?.filter((p) => p.is_completed).length ?? 0;

    const totalLessons =
      lessons.data?.length ?? 0;

    // ===== số đề đã làm =====

    const totalExams = new Set(
      (attempts.data ?? []).map((a: any) => a.exam_id)
    ).size;

    // ===== chỉ đề định kỳ =====

    const periodicAttempts =
      (attempts.data ?? []).filter(
        (a: any) =>
          a.exams?.category === "PERIODIC"
      );

    const averagePeriodicScore =
      periodicAttempts.length > 0
        ? periodicAttempts.reduce(
            (sum: number, item: any) =>
              sum + Number(item.score ?? 0),
            0
          ) / periodicAttempts.length
        : 0;

    return {
      profile: profile.data,

      totalCourses:
        courses.data?.length ?? 0,

      completedLessons,

      totalLessons,

      totalExams,

      averagePeriodicScore,
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
        .select("id")
        .is("deleted_at", null),

      supabase
        .from("lessons")
        .select("id")
        .is("deleted_at", null),

      supabase
        .from("profiles")
        .select("id")
        .eq("role", "STUDENT")
        .eq("is_active", true),

      supabase
        .from("exams")
        .select("id")
        .is("deleted_at", null),
    ]);

    return {
      totalCourses:
        courses.data?.length ?? 0,

      totalLessons:
        lessons.data?.length ?? 0,

      totalStudents:
        students.data?.length ?? 0,

      totalExams:
        exams.data?.length ?? 0,
    };
  }
}

export const dashboardRepository =
  new DashboardRepository();