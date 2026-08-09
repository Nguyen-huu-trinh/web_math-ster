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
            learning_goal:
            data.learning_goal ?? null,

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

    const supabase =
        await createClient();

    const {
        data,
        error,
    } = await supabase

        .from("v_teacher_dashboard")

        .select("*")

        .single();

    if (error) throw error;

    return {

        totalCourses:
            Number(data.total_courses),

        totalLessons:
            Number(data.total_lessons),

        totalStudents:
            Number(data.total_students),

        totalExams:
            Number(data.total_exams),

    };

}


async getActiveStudentCount() {

    const supabase =
        await createClient();

    const {
        data,
        error,
    } = await supabase
        .from("v_active_student_count")
        .select("active_students")
        .single();

    if (error) {
        throw error;
    }

    return {
        activeStudents:
            Number(
                data?.active_students ?? 0
            ),
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
