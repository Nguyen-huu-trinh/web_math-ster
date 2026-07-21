import { createClient } from "@/lib/supabase/server";

export class ExamRepository {
  async getAll() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: {
    title: string;
    description?: string;
    exam_type: "FREE" | "MOET";
    exam_category: "ATTENDANCE" | "PERIODIC";
    duration_minutes: number;
    total_score: number;
    max_attempts: number;
    start_at?: string | null;
    end_at?: string | null;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<{
      title: string;
      description: string;
      duration_minutes: number;
      total_score: number;
      max_attempts: number;
      start_at: string | null;
      end_at: string | null;
    }>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async open(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("exams")
      .update({
        status: "OPEN",
      })
      .eq("id", id);

    if (error) throw error;
  }

  async lock(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("exams")
      .update({
        status: "LOCKED",
      })
      .eq("id", id);

    if (error) throw error;
  }

  async softDelete(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("exams")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async restore(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("exams")
      .update({
        deleted_at: null,
      })
      .eq("id", id);

    if (error) throw error;
  }

  async getOpenExams() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("status", "OPEN")
      .is("deleted_at", null)
      .order("start_at");

    if (error) throw error;

    return data;
  }

  async getTeacherDashboard() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .select(`
        *,
        exam_attempts(count)
      `)
      .is("deleted_at", null);

    if (error) throw error;

    return data;
  }

  async getStudentExams(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .select(`
        *,
        exams(*)
      `)
      .eq("student_id", studentId);

    if (error) throw error;

    return data;
  }
}

export const examRepository = new ExamRepository();