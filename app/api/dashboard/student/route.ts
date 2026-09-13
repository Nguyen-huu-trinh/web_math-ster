import { NextResponse } from "next/server";
import { dashboardService } from "@/services/dashboard.service";
import { requireStudent } from "@/lib/auth/student";

// Ép Route Handler chạy ở môi trường Node.js tối ưu hoặc Edge nếu có thể
export const revalidate = 0; // Tránh Next.js build cache tĩnh ngoài ý muốn

export async function GET() {
  try {
    const profile = await requireStudent();

    const data = await dashboardService.studentDashboard(profile.id);

    return NextResponse.json(data, {
      headers: {
        // Cache phía Browser 3 phút (180s), Vercel CDN/SWR revalidate 600s
        "Cache-Control": "private, max-age=180, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: error?.status || 500 }
    );
  }
}