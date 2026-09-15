import { cache } from "react";
import { getServerSupabase } from "./auth-context";
import { requireAuth } from "./require-auth";

export const requireProfile = cache(async () => {
  // 1. requireAuth đã xác thực user
  const user = await requireAuth();

  // 2. Dùng lại instance Supabase đã được memoize qua getServerSupabase
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
        id,
        role,
        full_name,
        email,
        student_code,
        avatar_url,
        is_active,
        points,
        link_zoom
    `)
    .eq("id", user.id)
    .single();

  if (error || !data) {
    throw new Error("Profile not found");
  }

  // Nếu bạn muốn chặn tài khoản bị vô hiệu hóa, bỏ comment 3 dòng dưới:
  if (data.is_active === false) {
    throw new Error("Account is disabled");
  }

  return data;
});