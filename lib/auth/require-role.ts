import { requireProfile } from "./require-profile";
import { UserRole } from "./roles";

export async function requireRole(roles: UserRole[]) {
  const profile = await requireProfile();

  if (!roles.includes(profile.role)) {
    const error: any = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  return profile;
}