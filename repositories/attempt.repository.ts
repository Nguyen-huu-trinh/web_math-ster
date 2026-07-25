import { createClient } from "@/lib/supabase/client";

export interface CreateAttemptDto {
  exam_id: string;
  user_id: string;
  started_at?: string;
}

export class AttemptRepository {
  async getAllByExam(examId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("exam_id", examId)
      .order("started_at", { ascending: false });

    if (error) throw error;

    return data;
  }

  async getByUser(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateAttemptDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .insert({
        ...values,
        started_at:
          values.started_at ??
          new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async submit(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .update({
        submitted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async finish(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .update({
        finished_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateScore(
    id: string,
    score: number
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .update({
        score,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateDuration(
    id: string,
    duration_seconds: number
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .update({
        duration_seconds,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("exam_attempts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const attemptRepository =
  new AttemptRepository();