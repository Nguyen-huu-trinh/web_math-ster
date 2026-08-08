import { createClient } from "@/lib/supabase/server";

export class DashboardRepository {
  async getStudentDashboard(studentId: string) {

    const supabase =
        await createClient();

    const {
        data,
        error,
    } = await supabase

        .from("v_student_dashboard")

        .select("*")

        .eq("student_id", studentId)

        .single();

    if (error) throw error;

    return {

        profile: {

            full_name:
                data.full_name,

        },

        totalCourses:
            Number(data.total_courses),

        completedLessons:
            Number(data.completed_lessons),

        totalLessons:
            Number(data.total_lessons),

        pendingExams:
            Number(data.pending_exams),

        averagePeriodicScore:
            Number(
                data.average_periodic_score ?? 0
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

async lazyStudents() {

    const supabase = await createClient();

    const { data, error } = await supabase

        .from("v_lazy_students")

        .select("*")

        .limit(5);

    if (error) throw error;

    return data;

}

async lowHomeworkStudents() {

    const supabase = await createClient();

    const { data, error } = await supabase

        .from("v_low_homework_students")

        .select("*")

        .limit(5);

    if (error) throw error;

    return data;

}

async hardworkingStudents() {

    const supabase = await createClient();

    const { data, error } = await supabase

        .from("v_hardworking_students")

        .select("*")

        .limit(5);

    if (error) throw error;

    return data;

}

async excellentStudents() {

    const supabase = await createClient();

    const { data, error } = await supabase

        .from("v_excellent_students")

        .select("*")

        .limit(5);

    if (error) throw error;

    return data;

}




}




export const dashboardRepository =
  new DashboardRepository();
