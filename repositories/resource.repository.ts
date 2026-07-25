import { createClient } from "@/lib/supabase/client";

export class ResourceRepository {
  async getByLesson(lessonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .is("deleted_at", null)
      .order("order_index");

    if (error) throw error;

    return data;
  }

  async getVideos(lessonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("resource_type", "VIDEO")
      .is("deleted_at", null)
      .order("order_index");

    if (error) throw error;

    return data;
  }

  async getDocuments(lessonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("resource_type", "DOCUMENT")
      .is("deleted_at", null)
      .order("order_index");

    if (error) throw error;

    return data;
  }

  async getExercises(lessonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("resource_type", "EXERCISE")
      .is("deleted_at", null)
      .order("order_index");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_resources")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: {
    lesson_id: string;
    title: string;
    resource_type: "VIDEO" | "DOCUMENT" | "EXERCISE";
    url: string;
    order_index: number;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_resources")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<{
      title: string;
      url: string;
      order_index: number;
    }>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lesson_resources")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async reorder(id: string, orderIndex: number) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("lesson_resources")
      .update({
        order_index: orderIndex,
      })
      .eq("id", id);

    if (error) throw error;
  }

  async softDelete(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("lesson_resources")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async restore(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("lesson_resources")
      .update({
        deleted_at: null,
      })
      .eq("id", id);

    if (error) throw error;
  }
}

export const resourceRepository = new ResourceRepository();