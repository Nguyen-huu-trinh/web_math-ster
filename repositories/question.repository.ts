import { createClient } from "@/lib/supabase/client";
export class QuestionRepository {
  async getByExam(examId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", examId)
      .order("question_order");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: {
    exam_id: string;
    question_order: number;
    question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    content: string;
    score: number;
    explanation?: string | null;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("questions")
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
      score: number;
      explanation: string | null;
    }>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("questions")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async reorder(id: string, questionOrder: number) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("questions")
      .update({
        question_order: questionOrder,
      })
      .eq("id", id);

    if (error) throw error;
  }

  async delete(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async duplicate(questionId: string, examId: string) {
    const supabase = await createClient();

    const { data: question } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (!question) return null;

    const { data, error } = await supabase
      .from("questions")
      .insert({
        exam_id: examId,
        question_order: question.question_order,
        question_type: question.question_type,
        content: question.content,
        score: question.score,
        explanation: question.explanation,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}

export const questionRepository = new QuestionRepository();