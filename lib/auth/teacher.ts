import { UserRole } from "./roles";
import { requireRole } from "./require-role";

export function requireTeacher() {
  return requireRole([
    UserRole.ADMIN,
    UserRole.TEACHER,
  ]);
}