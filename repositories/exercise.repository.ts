import { createClient } from "@/lib/supabase/server";

export interface CreateExerciseDto {
  lesson_id: string;
  title: string;
  description?: string;
  exam_id: string;
  exercise_order: number;
  is_required?: boolean;
  is_published?: boolean;
}

export class ExerciseRepository {
  async getByLesson(lessonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_exercises")
      .select(`
        *,
        exams(
          id,
          title,
          duration_minutes,
          total_score
        )
      `)
      .eq("lesson_id", lessonId)
      .is("deleted_at", null)
      .order("exercise_order");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_exercises")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateExerciseDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_exercises")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<CreateExerciseDto>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_exercises")
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
      .from("lesson_exercises")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async publish(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_exercises")
      .update({
        is_published: true,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async unpublish(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_exercises")
      .update({
        is_published: false,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}

export const exerciseRepository =
  new ExerciseRepository();