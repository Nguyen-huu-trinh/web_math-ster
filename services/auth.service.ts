import { createClient } from "@/lib/supabase/client";

class AuthService {
  private supabase = createClient();


  async login(data: LoginDto) {
    const { data: auth, error } =
      await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (error) throw error;

    return auth.user;
  }

  async logout() {
    const { error } =
      await this.supabase.auth.signOut();

    if (error) throw error;
  }

  async getUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    return user;
  }

  async getSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    return session;
  }
}

export const authService = new AuthService();