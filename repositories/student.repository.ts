import { createClient } from "@/lib/supabase/server";

export interface CreateStudentDto {
  student_code: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface UpdateStudentDto {
  full_name?: string;
  avatar_url?: string;
  is_active?: boolean;
}

export class StudentRepository {
  async getAll() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "STUDENT")
      .is("deleted_at", null)
      .order("student_code");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "STUDENT")
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateStudentDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        ...values,
        role: "STUDENT",
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: UpdateStudentDto
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", id)
      .eq("role", "STUDENT")
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async activate(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_active: true,
      })
      .eq("id", id)
      .eq("role", "STUDENT")
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deactivate(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
      })
      .eq("id", id)
      .eq("role", "STUDENT")
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async softDelete(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("role", "STUDENT")
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async getProfileWithCourses(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        course_enrollments(
          course_id,
          courses(
            id,
            title
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async getStatistics(id: string) {
    const supabase = await createClient();

    const [
      attempts,
      progress,
      studyTime,
    ] = await Promise.all([
      supabase
        .from("exam_attempts")
        .select("score")
        .eq("student_id", id),

      supabase
        .from("learning_progress")
        .select("completed")
        .eq("student_id", id),

      supabase
        .from("study_time_logs")
        .select("total_seconds")
        .eq("student_id", id),
    ]);

    return {
      examCount:
        attempts.data?.length ?? 0,

      averageScore:
        attempts.data?.length
          ? attempts.data.reduce(
              (s, a) => s + Number(a.score ?? 0),
              0
            ) / attempts.data.length
          : 0,

      completedLessons:
        progress.data?.filter(
          p => p.completed
        ).length ?? 0,

      studySeconds:
        studyTime.data?.reduce(
          (s, t) => s + t.total_seconds,
          0
        ) ?? 0,
    };
  }
}

export const studentRepository =
  new StudentRepository();