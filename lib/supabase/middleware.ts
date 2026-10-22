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

  // Verify JWT locally with cached JWKS on asymmetric-key projects. API routes
  // retain their own getUser/role checks for current account and permissions.
  const { data, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsError ? undefined : data?.claims.sub;

  if (userId && !request.nextUrl.pathname.startsWith("/api/")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", userId)
      .single();

    if (error) throw error;

    if (profile?.must_change_password) {
      const url = request.nextUrl.clone();
      url.pathname = "/change-password";
      url.search = "";
      const redirect = NextResponse.redirect(url);
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }
  }

  return response;
}
