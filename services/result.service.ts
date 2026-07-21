import { createClient } from "@/lib/supabase/server";

export class ResultService {
  async getAttemptResult(
    attemptId: string
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("result_details")
      .select(`
        *,
        questions(*)
      `)
      .eq("attempt_id", attemptId)
      .order("question_id");

    if (error) throw error;

    return data;
  }

  async getScore(
    attemptId: string
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam_attempts")
      .select("score")
      .eq("id", attemptId)
      .single();

    if (error) throw error;

    return data;
  }
}

export const resultService =
  new ResultService();