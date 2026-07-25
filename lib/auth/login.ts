import { authService } from "@/services/auth.service";

import { profileRepository } from "@/repositories/profile.repository";

import { getDashboard } from "./redirect";

export async function login(
  email: string,
  password: string
) {
  const user =
    await authService.login({
      email,
      password,
    });

  const profile =
    await profileRepository.getProfile(
      user.id
    );

  if (!profile.is_active)
    throw new Error("Tài khoản đã bị khóa.");

  return {
    user,
    profile,
    redirect: getDashboard(profile.role),
  };
}