import { createClient } from "@/lib/supabase/server";

export class ProfileServerRepository {

  async updateProfile(
    id: string,
    values: {
      must_change_password?: boolean;
      full_name?: string;
      phone?: string | null;
      avatar_url?: string | null;
      is_active?: boolean;
    }
  ) {

    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("profiles")
        .update(values)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;
  }
}

export const profileServerRepository =
  new ProfileServerRepository();