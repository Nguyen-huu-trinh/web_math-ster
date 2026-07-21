import { profileRepository } from "@/repositories/profile.repository";
import { userRepository } from "@/repositories/user.repository";

export class UserService {
  create(values: {
    email: string;
    password: string;
    full_name: string;
    student_code: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
  }) {
    return userRepository.createUser(values);
  }

  getStudents() {
    return profileRepository.getAllStudents();
  }

  getTeachers() {
    return profileRepository.getAllTeachers();
  }

  getProfile(id: string) {
    return profileRepository.getById(id);
  }

  updateProfile(
    id: string,
    values: {
      full_name?: string;
      avatar_url?: string;
      is_active?: boolean;
    }
  ) {
    return profileRepository.updateProfile(id, values);
  }

  resetPassword(
    id: string,
    password: string
  ) {
    return userRepository.resetPassword(id, password);
  }

  delete(id: string) {
    return userRepository.deleteUser(id);
  }

  ban(id: string) {
    return userRepository.banUser(id);
  }

  unban(id: string) {
    return userRepository.unbanUser(id);
  }
}

export const userService = new UserService();