import { createClient } from "@/lib/supabase/server";

export interface CreateLessonDto {
  chapter_id: string;
  title: string;
  description?: string;
  lesson_order: number;
  estimated_minutes?: number;
  is_published?: boolean;
}

export class LessonRepository {
  async getByChapter(chapterId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("chapter_id", chapterId)
      .is("deleted_at", null)
      .order("lesson_order");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateLessonDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lessons")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<CreateLessonDto>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lessons")
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
      .from("lessons")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async restore(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lessons")
      .update({
        deleted_at: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async publish(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lessons")
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
      .from("lessons")
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

export const lessonRepository =
  new LessonRepository();