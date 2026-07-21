import { profileService } from "@/services/profile.service";
import { Permission, ROLE_PERMISSIONS } from "./permissions";

export async function hasPermission(
  permission: Permission
) {
  const profile =
    await profileService.getCurrentProfile();

  if (!profile) return false;

  return ROLE_PERMISSIONS[
    profile.role as keyof typeof ROLE_PERMISSIONS
  ].includes(permission);
}

export async function requirePermission(
  permission: Permission
) {
  const allow = await hasPermission(permission);

  if (!allow) {
    throw new Error("Forbidden");
  }
}