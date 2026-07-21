import { createClient } from "@/lib/supabase/server";

export interface CreateAdminDto {
  student_code: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface UpdateAdminDto {
  full_name?: string;
  avatar_url?: string;
  is_active?: boolean;
}

export class AdminRepository {
  async getAll() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "ADMIN")
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
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "ADMIN")
      .single();

    if (error) throw error;

    return data;
  }

  async create(values: CreateAdminDto) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        ...values,
        role: "ADMIN",
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(id: string, values: UpdateAdminDto) {
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

  async delete(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
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
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}

export const adminRepository = new AdminRepository();