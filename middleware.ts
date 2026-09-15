import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  // 1. Kiểm tra nhanh sự tồn tại của Cookie Supabase Token
  // Tên cookie mặc định của Supabase SSR thường chứa "sb-" và "-auth-token"
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("auth-token") || cookie.name.startsWith("sb-"));

  // 2. Nếu là request vào API mà KHÔNG có Cookie Auth -> Chặn ngay lập tức (Xử lý dưới 1ms CPU)
  if (request.nextUrl.pathname.startsWith("/api") && !hasAuthCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 3. Chỉ gọi Supabase re-validate khi có Cookie
  if (hasAuthCookie) {
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};