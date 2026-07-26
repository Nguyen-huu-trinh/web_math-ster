import { adminClient } from "@/lib/supabase/admin";
import { profileServerRepository } from "@/repositories/profile.server.repository";

export class ProfileServerService {
  async changePassword(
    userId: string,
    newPassword: string
  ) {
    const { error } =
      await adminClient.auth.admin.updateUserById(
        userId,
        {
          password: newPassword,
        }
      );

    if (error) throw error;

    await profileServerRepository.updateProfile(
      userId,
      {
        must_change_password: false,
      }
    );
  }

  async getCurrentProfile(userId: string) {
  return profileServerRepository.getCurrentProfile(userId);
}

async update(userId: string, values: any) {
  return profileServerRepository.updateProfile(
    userId,
    values
  );
}
}

export const profileServerService =
  new ProfileServerService();