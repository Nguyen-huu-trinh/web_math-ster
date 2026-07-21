import { createClient } from "@/lib/supabase/server";

export interface CreateStudentAnswerDto {
  attempt_id: string;
  question_id: string;
  answer_id?: string | null;
  answer_text?: string | null;
}

export class StudentAnswerRepository {
  async getByAttempt(attemptId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_answers")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("created_at");

    if (error) throw error;

    return data;
  }

  async getByQuestion(
    attemptId: string,
    questionId: string
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_answers")
      .select("*")
      .eq("attempt_id", attemptId)
      .eq("question_id", questionId)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  async save(values: CreateStudentAnswerDto) {
    const supabase = await createClient();

    const old = await this.getByQuestion(
      values.attempt_id,
      values.question_id
    );

    if (old) {
      const { data, error } = await supabase
        .from("student_answers")
        .update({
          answer_id: values.answer_id,
          answer_text: values.answer_text,
          updated_at: new Date().toISOString(),
        })
        .eq("id", old.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    }

    const { data, error } = await supabase
      .from("student_answers")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("student_answers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async deleteByAttempt(
    attemptId: string
  ) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("student_answers")
      .delete()
      .eq("attempt_id", attemptId);

    if (error) throw error;
  }
}

export const studentAnswerRepository =
  new StudentAnswerRepository();