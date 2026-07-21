import { createClient } from "@/lib/supabase/server";

export class ProfileRepository {
  async getCurrentProfile() {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return data;
  }

  async getById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async getByStudentCode(studentCode: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("student_code", studentCode)
      .single();

    if (error) throw error;

    return data;
  }

  async getAllStudents() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "STUDENT")
      .eq("is_active", true)
      .order("student_code");

    if (error) throw error;

    return data;
  }

  async getAllTeachers() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "TEACHER")
      .eq("is_active", true)
      .order("student_code");

    if (error) throw error;

    return data;
  }

  async updateProfile(
    id: string,
    values: {
      full_name?: string;
      avatar_url?: string | null;
      must_change_password?: boolean;
      is_active?: boolean;
    }
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteProfile(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }
}

export const profileRepository = new ProfileRepository();