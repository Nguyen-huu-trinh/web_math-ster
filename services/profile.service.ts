import { profileRepository } from "@/repositories/profile.repository";

export class ProfileService {
  getCurrentProfile() {
    return profileRepository.getCurrentProfile();
  }

  getById(id: string) {
    return profileRepository.getById(id);
  }

  getByStudentCode(studentCode: string) {
    return profileRepository.getByStudentCode(studentCode);
  }

  getStudents() {
    return profileRepository.getAllStudents();
  }

  getTeachers() {
    return profileRepository.getAllTeachers();
  }

  update(
    id: string,
    values: {
      full_name?: string;
      avatar_url?: string | null;
      must_change_password?: boolean;
      is_active?: boolean;
    }
  ) {
    return profileRepository.updateProfile(id, values);
  }

  deactivate(id: string) {
    return profileRepository.deleteProfile(id);
  }
}

export const profileService = new ProfileService();