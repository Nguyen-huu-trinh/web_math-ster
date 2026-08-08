import { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";

export async function POST(
    request: NextRequest
) {
    try {
        const supabase =
            await createClient();

        const {
            data: {
                user,
            },
        } =
            await supabase.auth.getUser();

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const {
            data: profile,
            error: profileError,
        } =
            await supabase
                .from("profiles")
                .select(
                    "id, is_active, session_id"
                )
                .eq("id", user.id)
                .single();

        if (profileError) {
            throw profileError;
        }

        if (
            profile.is_active === false
        ) {
            return Response.json(
                {
                    success: false,
                    message:
                        "ACCOUNT_DISABLED",
                },
                {
                    status: 403,
                }
            );
        }

        if (!profile.session_id) {
            return Response.json(
                {
                    success: false,
                    message:
                        "SESSION_NOT_FOUND",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * Session ID của thiết bị hiện tại.
         */
        const sessionId =
            request.cookies.get(
                "mathster_session_id"
            )?.value;

        /*
         * Thiết bị hiện tại không còn
         * là thiết bị đăng nhập mới nhất.
         */
        if (
            !sessionId ||
            sessionId !==
                profile.session_id
        ) {
            return Response.json(
                {
                    success: false,
                    message:
                        "SESSION_REPLACED",
                },
                {
                    status: 401,
                }
            );
        }

        const now =
            new Date().toISOString();

        const {
            error: updateError,
        } =
            await supabase
                .from("profiles")
                .update({
                    last_seen_at: now,
                    updated_at: now,
                })
                .eq("id", user.id)
                .eq(
                    "session_id",
                    profile.session_id
                );

        if (updateError) {
            throw updateError;
        }

        return success({
            active: true,
            lastSeenAt: now,
        });

    } catch (error) {

        console.error(
            "HEARTBEAT ERROR:",
            error
        );

        return handleError(error);
    }
}