
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
        .from("course_enrollments")
        .select("id")
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
        .select("score")
        .eq("student_id", studentId),

    ]);

    const completedLessons =
      progress.data?.filter(
        p => p.is_completed
      ).length ?? 0;

    const totalLessons =
      lessons.data?.length ?? 0;

    return {

      profile: profile.data,

      totalCourses:
        courses.data?.length ?? 0,

      completedLessons,

      totalLessons,

      totalAttempts:
        attempts.data?.length ?? 0,

      averageScore:
        attempts.data?.length
          ? attempts.data.reduce(
              (sum, item) => sum + Number(item.score ?? 0),
              0
            ) / attempts.data.length
          : 0,

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
        .select("id"),

      supabase
        .from("lessons")
        .select("id"),

      supabase
        .from("profiles")
        .select("id")
        .eq("role", "STUDENT"),

      supabase
        .from("exams")
        .select("id"),

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

