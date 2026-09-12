import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Dùng global singleton để tái sử dụng instance, tránh khởi tạo lại SDK mỗi khi Serverless Function chạy
const globalForSupabase = globalThis as unknown as {
  adminClient: ReturnType<typeof createClient> | undefined;
};

export const adminClient =
  globalForSupabase.adminClient ??
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.adminClient = adminClient;
}