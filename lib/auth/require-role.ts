import { requireProfile } from "./require-profile";
import { UserRole } from "./roles";

export async function requireRole(
  roles: UserRole[]
) {
  const profile = await requireProfile();

  if (!roles.includes(profile.role)) {
    throw new Error("Forbidden");
  }

  return profile;
}