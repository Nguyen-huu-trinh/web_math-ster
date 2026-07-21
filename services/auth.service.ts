import { createClient } from "@/lib/supabase/server";

export class AuthService {
  async getCurrentUser() {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  }

  async getSession() {
    const supabase = await createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  }

  async requireUser() {
    const user = await this.getCurrentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    return user;
  }

  async signOut() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }
}

export const authService = new AuthService();