import { NextResponse } from "next/server";

import { UserRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        await requireRole([
            UserRole.TEACHER,
        ]);

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("attendance")
            .select("code")
            .not("code", "is", null)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(
                "GET CURRENT ATTENDANCE ERROR:",
                error
            );

            return NextResponse.json(
                {
                    error: error.message,
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: data
                ? {
                      code: data.code,
                  }
                : null,
        });

    } catch (error) {
        console.error(
            "CURRENT ATTENDANCE API ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            {
                status: 500,
            }
        );
    }
}