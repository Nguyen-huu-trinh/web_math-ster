import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";

export async function requireAuth() {
  const user = await authService.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await profileService.getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return {
    user,
    profile,
  };
}

export async function requireAdmin() {
  const { user, profile } = await requireAuth();

  if (profile.role !== "ADMIN") {
    redirect("/403");
  }

  return {
    user,
    profile,
  };
}

export async function requireTeacher() {
  const { user, profile } = await requireAuth();

  if (
    profile.role !== "ADMIN" &&
    profile.role !== "TEACHER"
  ) {
    redirect("/403");
  }

  return {
    user,
    profile,
  };
}

export async function requireStudent() {
  const { user, profile } = await requireAuth();

  if (profile.role !== "STUDENT") {
    redirect("/403");
  }

  return {
    user,
    profile,
  };
}
