import { createClient } from "@/lib/supabase/server";

import { success } from "@/lib/api/api-response";
import { handleError } from "@/lib/api/handle-error";

export async function POST() {

    try {

        const supabase =
            await createClient();

        /*
         * Lấy user từ Supabase Auth.
         *
         * Không nhận user_id từ frontend.
         */
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
                    message:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * Kiểm tra tài khoản có được phép
         * đăng nhập hay không.
         */
        const {
            data: profile,
            error:
                profileError,
        } = await supabase

            .from("profiles")

            .select(
                "id, is_active"
            )

            .eq("id", user.id)

            .single();

        if (profileError) {
            throw profileError;
        }

        /*
         * is_active hiện được hiểu là:
         *
         * "Tài khoản có được phép sử dụng hay không"
         *
         * KHÔNG phải trạng thái online.
         */
        if (
            profile &&
            profile.is_active === false
        ) {

            await supabase.auth.signOut();

            return Response.json(
                {
                    success: false,
                    message:
                        "Tài khoản đã bị vô hiệu hóa.",
                },
                {
                    status: 403,
                }
            );
        }

        /*
         * Server tự tạo session ID.
         */
        const sessionId =
            crypto.randomUUID();

        const now =
            new Date().toISOString();

        const {
            error,
        } = await supabase

            .from("profiles")

            .update({

                session_id:
                    sessionId,

                last_seen_at:
                    now,

                updated_at:
                    now,

            })

            .eq(
                "id",
                user.id
            );

        if (error) {
            throw error;
        }

       const response =
    success({
        sessionId,
    });

response.cookies.set(
    "mathster_session_id",
    sessionId,
    {
        httpOnly: true,
        secure:
            process.env.NODE_ENV ===
            "production",
        sameSite: "lax",
        path: "/",
        maxAge:
            60 * 60 * 24 * 30,
    }
);

return response;

    } catch (error) {

        console.error(
            "CREATE AUTH SESSION ERROR:",
            error
        );

        return handleError(error);
    }
}

export async function DELETE() {

    try {

        const response =
            success({
                loggedOut: true,
            });

        response.cookies.delete(
            "mathster_session_id"
        );

        return response;

    } catch (error) {

        return handleError(error);

    }
}