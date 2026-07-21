import { createClient } from "@/lib/supabase/server";

export interface CreateTeacherDto {
  student_code: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface UpdateTeacherDto {
  full_name?: string;
  avatar_url?: string;
  is_active?: boolean;
}

export class TeacherRepository {
  async getAll() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "TEACHER")
      .is("deleted_at", null)
      .order("full_name");

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "TEACHER")
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateTeacherDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        ...values,
        role: "TEACHER",
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(
    id: string,
    values: UpdateTeacherDto
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", id)
      .eq("role", "TEACHER")
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deactivate(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
      })
      .eq("id", id)
      .eq("role", "TEACHER")
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async activate(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_active: true,
      })
      .eq("id", id)
      .eq("role", "TEACHER")
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async softDelete(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("role", "TEACHER")
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}

export const teacherRepository =
  new TeacherRepository();