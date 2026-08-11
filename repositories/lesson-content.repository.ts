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
  private supabase = createClient();

  async getByLesson(lessonId: string) {
    const { data, error } =
        await this.supabase
            .from("lesson_contents")
            .select(`
                *,
                file_links(*)
            `)
            .eq("lesson_id", lessonId)
            .order("order_index");

    if (error) throw error;

    return data as LessonContent[];
}

  async create(values: CreateLessonContentDto) {
    console.log("CREATE RESOURCE", values);

    // 1. Create file link
    const { data: fileLink, error: fileError } = await this.supabase
      .from("file_links")
      .insert({
        title: values.title,
        provider: values.provider,
        url: values.url,
      })
      .select()
      .single();

    if (fileError) {
      console.error("FILE LINK ERROR", fileError);
      throw fileError;
    }

    console.log("FILE LINK CREATED", fileLink);

    // 2. Create lesson content
    const { data, error } = await this.supabase
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
        file_links(*)
      `)
      .single();

    if (error) {
      console.error("LESSON CONTENT ERROR", error);

      // rollback
      await this.supabase
        .from("file_links")
        .delete()
        .eq("id", fileLink.id);

      throw error;
    }

    console.log("LESSON CONTENT CREATED", data);

    return data;
  }

  async update(
    id: string,
    values: UpdateLessonContentDto
  ) {
    console.log("UPDATE RESOURCE", values);

    const { data: current, error: currentError } =
      await this.supabase
        .from("lesson_contents")
        .select("file_link_id")
        .eq("id", id)
        .single();

    if (currentError) throw currentError;

    if (!current)
      throw new Error("Resource not found");

    // update file link
    const { error: fileError } =
      await this.supabase
        .from("file_links")
        .update({
          title: values.title,
          provider: values.provider,
          url: values.url,
        })
        .eq("id", current.file_link_id);

    if (fileError) throw fileError;

    // update lesson content
    const { data, error } =
      await this.supabase
        .from("lesson_contents")
        .update({
          title: values.title,
          type: values.type,
          order_index: values.order_index,
        })
        .eq("id", id)
        .select(`
          *,
          file_links(*)
        `)
        .single();

    if (error) throw error;

    console.log("RESOURCE UPDATED", data);

    return data;
  }

  async delete(id: string) {
    console.log("DELETE RESOURCE", id);

    const { data: current, error: currentError } =
      await this.supabase
        .from("lesson_contents")
        .select("file_link_id")
        .eq("id", id)
        .single();

    if (currentError) throw currentError;

    if (!current) return;

    const { error: lessonError } =
      await this.supabase
        .from("lesson_contents")
        .delete()
        .eq("id", id);

    if (lessonError) throw lessonError;

    const { error: fileError } =
      await this.supabase
        .from("file_links")
        .delete()
        .eq("id", current.file_link_id);

    if (fileError) throw fileError;

    console.log("RESOURCE DELETED");
  }
}

export const lessonContentRepository =
  new LessonContentRepository();