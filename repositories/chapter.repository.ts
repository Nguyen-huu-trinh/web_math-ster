import { createClient } from "@/lib/supabase/server";

export interface CreateChapterDto {
  course_id: string;
  title: string;
  description?: string;
  chapter_order: number;
}

export class ChapterRepository {
  async getByCourse(courseId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("course_id", courseId)
      .is("deleted_at", null)
      .order("chapter_order");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateChapterDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chapters")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<CreateChapterDto>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chapters")
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
      .from("chapters")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async restore(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chapters")
      .update({
        deleted_at: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async reorder(
    id: string,
    chapter_order: number
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chapters")
      .update({
        chapter_order,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}

export const chapterRepository =
  new ChapterRepository();