import { profileRepository } from "@/repositories/profile.repository";
import { Profile } from "@/types/profile";
import { profileServerRepository }
from "@/repositories/profile.server.repository";

export class ProfileService {
  getCurrentProfile(): Promise<Profile | null> {
    return profileRepository.getCurrentProfile();
  }

  getById(id: string): Promise<Profile> {
    return profileRepository.getById(id);
  }

  update(
    id: string,
    values: Partial<
      Pick<
        Profile,
        | "full_name"
        | "personal_email"
        | "avatar_url"
        | "phone"
        | "must_change_password"
        | "is_active"
      >
    >
  ) {
    return profileServerRepository.updateProfile(id, values);
  }

  /**
   * Đổi mật khẩu
   */
  // async changePassword(
  //   userId: string,
  //   newPassword: string
  // ) {
  //   const { error } =
  //   //   await adminClient.auth.admin.updateUserById(
  //   //     userId,
  //   //     {
  //   //       password: newPassword,
  //   //     }
  //   //   );

  //   // if (error) throw error;

    // Sau khi đổi mật khẩu lần đầu thì bỏ cờ
//     await profileRepository.updateProfile(userId, {
//       must_change_password: false,
//     });

//     return true;
//   }

async changePassword(
  newPassword: string
) {
  return profileRepository.changePassword(
    newPassword
  );
}
}

export const profileService = new ProfileService();