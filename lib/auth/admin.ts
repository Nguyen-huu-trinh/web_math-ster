import { UserRole } from "./roles";
import { requireRole } from "./require-role";

export function requireAdmin() {
  return requireRole([
    UserRole.ADMIN,
  ]);
}