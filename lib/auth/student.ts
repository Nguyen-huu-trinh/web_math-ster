import { UserRole } from "./roles";
import { requireRole } from "./require-role";

export function requireStudent() {
  return requireRole([
    UserRole.STUDENT,
  ]);
}