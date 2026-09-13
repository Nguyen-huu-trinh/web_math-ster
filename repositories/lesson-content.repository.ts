import { createClient } from "@/lib/supabase/client";

export interface CreateLessonContentDto {
  lesson_id: string;
  title: string;
  type: "VIDEO" | "PDF" | "EXAM";
  provider: string;
  url: string;
  order_index: number;
}

export interface UpdateLessonContentDto {
  title?: string;
  type?: "VIDEO" | "PDF" | "EXAM";
  provider?: string;
  url?: string;
  order_index?: number;
}

export interface LessonContent {
  id: string;
  lesson_id: string;
  title: string;
  type: "VIDEO" | "PDF" | "EXAM";
  order_index: number;
  file_link_id: string | null;
  exam_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  file_links: {
    id: string;
    title: string;
    provider: string;
    url: string;
    created_at?: string | null;
    updated_at?: string | null;
  } | null;
}

class LessonContentRepository {
  private getClient() {
    return createClient();
  }

  async getByLesson(lessonId: string) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("lesson_contents")
      .select(`
        id,
        lesson_id,
        title,
        type,
        order_index,
        file_link_id,
        exam_id,
        created_at,
        updated_at,
        file_links (
          id,
          title,
          provider,
          url
        )
      `)
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as LessonContent[];
  }

  async create(values: CreateLessonContentDto) {
    const supabase = this.getClient();

    // 1. Tạo file link
    const { data: fileLink, error: fileError } = await supabase
      .from("file_links")
      .insert({
        title: values.title,
        provider: values.provider,
        url: values.url,
      })
      .select("id")
      .single();

    if (fileError) throw fileError;

    // 2. Tạo lesson content
    const { data, error } = await supabase
      .from("lesson_contents")
      .insert({
        lesson_id: values.lesson_id,
        file_link_id: fileLink.id,
        title: values.title,
        type: values.type,
        order_index: values.order_index,
      })
      .select(`
        *,
        file_links (*)
      `)
      .single();

    if (error) {
      // Rollback file_link nếu tạo content thất bại
      await supabase.from("file_links").delete().eq("id", fileLink.id);
      throw error;
    }

    return data as unknown as LessonContent;
  }

  async update(id: string, values: UpdateLessonContentDto) {
    const supabase = this.getClient();

    // Tối ưu: Lấy file_link_id và update lesson_contents cùng 1 bước select
    const { data: updatedContent, error: contentError } = await supabase
      .from("lesson_contents")
      .update({
        title: values.title,
        type: values.type,
        order_index: values.order_index,
      })
      .eq("id", id)
      .select("file_link_id")
      .single();

    if (contentError) throw contentError;

    // Cập nhật thông tin file_link song song nếu có liên kết
    if (updatedContent?.file_link_id) {
      const { error: fileError } = await supabase
        .from("file_links")
        .update({
          ...(values.title && { title: values.title }),
          ...(values.provider && { provider: values.provider }),
          ...(values.url && { url: values.url }),
        })
        .eq("id", updatedContent.file_link_id);

      if (fileError) throw fileError;
    }

    // Trả về dữ liệu mới nhất
    return this.getByLessonContentId(id);
  }

  async delete(id: string) {
    const supabase = this.getClient();

    // Tối ưu: Lấy file_link_id trước khi xóa
    const { data: current } = await supabase
      .from("lesson_contents")
      .select("file_link_id")
      .eq("id", id)
      .maybeSingle();

    if (!current) return;

    // Xóa lesson content
    const { error: lessonError } = await supabase
      .from("lesson_contents")
      .delete()
      .eq("id", id);

    if (lessonError) throw lessonError;

    // Xóa liên kết file_link ngay sau đó
    if (current.file_link_id) {
      await supabase
        .from("file_links")
        .delete()
        .eq("id", current.file_link_id);
    }
  }

  private async getByLessonContentId(id: string) {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from("lesson_contents")
      .select(`
        *,
        file_links (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as unknown as LessonContent;
  }
}

export const lessonContentRepository = new LessonContentRepository();