import { createClient } from "@/lib/supabase/server";

export class DashboardRepository {

  async getStudentDashboard(studentId: string) {

    const supabase = await createClient();

    const [
      profile,
      courses,
      progress,
      attempts,
      studyTime,
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
        .from("learning_progress")
        .select("completed"),

      supabase
        .from("exam_attempts")
        .select("score"),

      supabase
        .from("study_time_logs")
        .select("total_seconds")
        .eq("student_id", studentId),

    ]);

    return {

      profile: profile.data,

      totalCourses:
        courses.data?.length ?? 0,

      completedLessons:
        progress.data?.filter(
          p => p.completed
        ).length ?? 0,

      totalAttempts:
        attempts.data?.length ?? 0,

      averageScore:
        attempts.data?.length
          ? attempts.data.reduce(
              (s, a) => s + Number(a.score ?? 0),
              0
            ) / attempts.data.length
          : 0,

      totalStudySeconds:
        studyTime.data?.reduce(
          (s, t) => s + t.total_seconds,
          0
        ) ?? 0,

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
        .eq("role","STUDENT"),

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