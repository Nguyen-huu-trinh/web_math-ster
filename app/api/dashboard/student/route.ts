import { NextResponse } from "next/server";

import { dashboardService } from "@/services/dashboard.service";
import { requireStudent } from "@/lib/auth/student";

export async function GET() {
  const profile = await requireStudent();

  const data = await dashboardService.studentDashboard(profile.id);

  return NextResponse.json(data, {
    headers: {
      // Trình duyệt của học sinh lưu cache 3 phút (180s)
      "Cache-Control": "private, max-age=1800, stale-while-revalidate=600",
    },
  });
}