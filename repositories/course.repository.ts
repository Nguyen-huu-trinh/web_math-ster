import { createClient } from "@/lib/supabase/server";

export interface CreateCourseDto {
  name: string;
  description?: string;
  thumbnail_url?: string;
  is_active?: boolean;
}

export class CourseRepository {
  async getAll() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateCourseDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: Partial<CreateCourseDto>
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
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
      .from("courses")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async restore(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .update({
        deleted_at: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}

export const courseRepository =
  new CourseRepository();