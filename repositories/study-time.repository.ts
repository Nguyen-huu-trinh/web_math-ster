import { createClient } from "@/lib/supabase/server";

export interface UpdateStudyTimeDto {
  student_id: string;
  lesson_id?: string;
  course_id?: string;
  seconds: number;
}

export class StudyTimeRepository {
  async addTime(values: UpdateStudyTimeDto) {
    const supabase = await createClient();

    const today = new Date().toISOString().slice(0, 10);

    const { data: current } = await supabase
      .from("study_time_logs")
      .select("*")
      .eq("student_id", values.student_id)
      .eq("study_date", today)
      .maybeSingle();

    if (current) {
      const { data, error } = await supabase
        .from("study_time_logs")
        .update({
          total_seconds:
            current.total_seconds + values.seconds,
          updated_at: new Date().toISOString(),
        })
        .eq("id", current.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    }

    const { data, error } = await supabase
      .from("study_time_logs")
      .insert({
        student_id: values.student_id,
        course_id: values.course_id,
        lesson_id: values.lesson_id,
        total_seconds: values.seconds,
        study_date: today,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async getDaily(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("study_time_logs")
      .select("*")
      .eq("student_id", studentId)
      .order("study_date", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  }

  async getToday(studentId: string) {
    const supabase = await createClient();

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("study_time_logs")
      .select("*")
      .eq("student_id", studentId)
      .eq("study_date", today)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  async getTotal(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("study_time_logs")
      .select("total_seconds")
      .eq("student_id", studentId);

    if (error) throw error;

    return data.reduce(
      (sum, row) => sum + row.total_seconds,
      0
    );
  }

  async leaderboard() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("study_time_logs")
      .select(`
        student_id,
        total_seconds,
        profiles(
          full_name,
          student_code
        )
      `)
      .order("total_seconds", {
        ascending: false,
      })
      .limit(20);

    if (error) throw error;

    return data;
  }
}

export const studyTimeRepository =
  new StudyTimeRepository();