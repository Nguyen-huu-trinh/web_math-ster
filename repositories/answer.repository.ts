import { createClient } from "@/lib/supabase/server";

export class AnswerRepository {
  async getByQuestion(questionId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("answers")
      .select("*")
      .eq("question_id", questionId)
      .order("answer_order");

    if (error) throw error;

    return data;
  }

  async create(values: {
    question_id: string;
    answer_order: number;
    content: string;
    is_correct: boolean;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("answers")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<{
      content: string;
      is_correct: boolean;
      answer_order: number;
    }>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("answers")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("answers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async replaceAll(
    questionId: string,
    answers: {
      answer_order: number;
      content: string;
      is_correct: boolean;
    }[]
  ) {
    const supabase = await createClient();

    await supabase
      .from("answers")
      .delete()
      .eq("question_id", questionId);

    const payload = answers.map((answer) => ({
      ...answer,
      question_id: questionId,
    }));

    const { data, error } = await supabase
      .from("answers")
      .insert(payload)
      .select();

    if (error) throw error;

    return data;
  }
}

export const answerRepository = new AnswerRepository();
