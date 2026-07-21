import { adminClient } from "@/lib/supabase/admin";

export class UserRepository {
  async createUser(values: {
    email: string;
    password: string;
    full_name: string;
    student_code: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
  }) {
    const { data, error } =
      await adminClient.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          full_name: values.full_name,
          role: values.role,
        },
      });

    if (error) throw error;

    return data.user;
  }

  async deleteUser(id: string) {
    const { error } =
      await adminClient.auth.admin.deleteUser(id);

    if (error) throw error;
  }

  async resetPassword(
    id: string,
    password: string
  ) {
    const { data, error } =
      await adminClient.auth.admin.updateUserById(id, {
        password,
      });

    if (error) throw error;

    return data.user;
  }

  async banUser(id: string) {
    const { data, error } =
      await adminClient.auth.admin.updateUserById(id, {
        ban_duration: "876000h",
      });

    if (error) throw error;

    return data.user;
  }

  async unbanUser(id: string) {
    const { data, error } =
      await adminClient.auth.admin.updateUserById(id, {
        ban_duration: "none",
      });

    if (error) throw error;

    return data.user;
  }
}

export const userRepository = new UserRepository();