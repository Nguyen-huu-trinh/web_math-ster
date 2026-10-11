import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/flashcards/:path*", "/teacher/:path*",
    "/student/:path*", "/student-exams/:path*", "/admin/:path*", "/api/:path*",
  ],
};
