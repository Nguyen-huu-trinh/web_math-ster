import { NextResponse } from "next/server";
import { dashboardService } from "@/services/dashboard.service";
import { requireStudent } from "@/lib/auth/student";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await requireStudent();

    const data = await dashboardService.studentDashboard(profile.id);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: error?.status || 500 }
    );
  }
}