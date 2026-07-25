import { NextResponse } from "next/server";

import { dashboardService } from "@/services/dashboard.service";

import { requireStudent } from "@/lib/auth/student";

export async function GET(){

    const profile =
        await requireStudent();
     console.log("PROFILE:", profile);
    console.log("PROFILE.ID:", profile.id);
    return NextResponse.json(

        await dashboardService.studentDashboard(
            profile.id
        )

    );

}