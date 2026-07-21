import { NextResponse } from "next/server";

import { dashboardService } from "@/services/dashboard.service";

import { requireTeacher } from "@/lib/auth/teacher";

export async function GET(){

    await requireTeacher();

    return NextResponse.json(

        await dashboardService.teacherDashboard()

    );

}