export type UserRole =
  | "ADMIN"
  | "TEACHER"
  | "STUDENT";

export interface Profile {
  id: string;

  full_name: string;

  avatar_url: string | null;

  role: UserRole;

  student_code: string | null;

  phone: string | null;

  email?: string;

  must_change_password: boolean;

  is_active: boolean;

  created_at: string;

  updated_at: string;
  personal_email: string | null;
}