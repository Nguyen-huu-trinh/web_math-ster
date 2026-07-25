import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/profile";

class ProfileRepository {
  private supabase = createClient();

  async getCurrentProfile(): Promise<Profile | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) return null;

    return this.getProfile(user.id);
  }

  async getProfile(id: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data as Profile;
  }

  async getById(id: string): Promise<Profile> {
    return this.getProfile(id);
  }

  async updateProfile(
    id: string,
    values: Partial<
      Pick<
        Profile,
        | "full_name"
        | "avatar_url"
        | "phone"
        | "must_change_password"
        | "is_active"
      >
    >
  ): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Profile;
  }
}

export const profileRepository = new ProfileRepository();