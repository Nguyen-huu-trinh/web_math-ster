import { createClient } from "@/lib/supabase/client";

export interface CreateLessonDto {
  chapter_id: string;
  title: string;
  order_index: number;
  is_active?: boolean;
}

export interface UpdateLessonDto {
  title?: string;
  order_index?: number;
  is_active?: boolean;
}

class LessonRepository {
  // Loại bỏ private property supabase để tránh giữ state client cũ trong closure
  private getClient() {
    return createClient();
  }

  async getByChapter(chapterId: string) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("id, chapter_id, title, order_index, is_active")
      .eq("chapter_id", chapterId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getById(id: string) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("id, chapter_id, title, order_index, is_active")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(dto: CreateLessonDto) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        chapter_id: dto.chapter_id,
        title: dto.title,
        order_index: dto.order_index,
        is_active: dto.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateLessonDto) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("lessons")
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const supabase = this.getClient();
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const lessonRepository = new LessonRepository();