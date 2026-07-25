import { createClient } from "@/lib/supabase/client";

export interface CreateChapterDto {
  course_id: string;
  title: string;
  order_index: number;
}

class ChapterRepository {
  private supabase = createClient();

  async getByCourse(courseId: string) {
    const { data, error } = await this.supabase
      .from("chapters")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index");

    if (error) throw error;

    return data;
  }

  async create(data: CreateChapterDto) {
    const { data: chapter, error } =
      await this.supabase
        .from("chapters")
        .insert(data)
        .select()
        .single();

    if (error) throw error;

    return chapter;
  }

  async update(
    id: string,
    values: Partial<CreateChapterDto>
  ) {
    const { data, error } =
      await this.supabase
        .from("chapters")
        .update(values)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string) {
    const { error } =
      await this.supabase
        .from("chapters")
        .delete()
        .eq("id", id);

    if (error) throw error;
  }
}

export const chapterRepository =
  new ChapterRepository();