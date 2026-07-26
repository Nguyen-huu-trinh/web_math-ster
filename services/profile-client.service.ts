import { profileRepository } from "@/repositories/profile.repository";
import { Profile } from "@/types/profile";

export class ProfileClientService {
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
        | "avatar_url"
        | "phone"
        | "must_change_password"
        | "is_active"
      >
    >
  ) {
    return profileRepository.updateProfile(id, values);
  }
async changePassword(
  currentPassword: string,
  newPassword: string
) {
  const res = await fetch(
    "/api/profile/change-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result.message ?? "Failed to change password"
    );
  }

  return result;
}

}

export const profileClientService =
  new ProfileClientService();