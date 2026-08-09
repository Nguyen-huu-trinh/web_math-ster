import { User } from "@supabase/supabase-js";

export interface Profile {

  id: string;

  full_name: string;

  avatar_url: string | null;

  email?: string;

  role: "ADMIN" | "TEACHER" | "STUDENT";

  student_code?: string | null;

  phone?: string | null;

  is_active: boolean;

  must_change_password: boolean;

  created_at: string;

  updated_at: string;

  personal_email: string | null;

  points: number;
  
}

export interface AuthContextType {

  user: User | null;

  profile: Profile | null;

  loading: boolean;

  login(
    email: string,
    password: string
  ): Promise<void>;

  logout(): Promise<void>;

  refresh(): Promise<void>;
}