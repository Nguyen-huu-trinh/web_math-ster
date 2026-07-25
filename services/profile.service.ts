import { profileRepository } from "@/repositories/profile.repository";
import { Profile } from "@/types/profile";

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
        | "avatar_url"
        | "phone"
        | "must_change_password"
        | "is_active"
      >
    >
  ) {
    return profileRepository.updateProfile(id, values);
  }
}

export const profileService = new ProfileService();