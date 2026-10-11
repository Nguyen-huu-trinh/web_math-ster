import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          const previousCookies = response.cookies.getAll();
          const previousHeaders = new Headers(response.headers);
          response = NextResponse.next({
            request,
          });

          previousCookies.forEach((cookie) => response.cookies.set(cookie));
          ["Cache-Control", "Expires", "Pragma"].forEach((name) => {
            const value = previousHeaders.get(name);
            if (value) response.headers.set(name, value);
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers ?? {}).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
