import { createClient } from "@/lib/supabase/client";

export interface LoginDto {
    email: string;
    password: string;
}

class AuthService {
    private supabase = createClient();

    async login(data: LoginDto) {
        const {
            data: auth,
            error,
        } = await this.supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (error) {
            throw error;
        }

        if (!auth.user) {
            throw new Error(
                "Không thể xác định người dùng."
            );
        }

        /*
         * Supabase login thành công.
         *
         * Tiếp theo tạo application session
         * ở phía server.
         */
        const response = await fetch(
            "/api/auth/session",
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json",
                },
            }
        );

        if (!response.ok) {
            /*
             * Nếu tạo application session thất bại,
             * rollback Supabase login.
             */
            await this.supabase.auth.signOut();

            let message =
                "Không thể tạo phiên đăng nhập.";

            try {
                const result =
                    await response.json();

                message =
                    result.message ??
                    message;
            } catch {}

            throw new Error(message);
        }

        const result =
            await response.json();

        return {
            user: auth.user,

            sessionId:
                result.data?.sessionId ?? null,
        };
    }

    async logout() {

    try {

        await fetch(
            "/api/auth/session",
            {
                method: "DELETE",

                credentials: "include",
            }
        );

    } finally {

        const {
            error,
        } =
            await this.supabase.auth
                .signOut();

        if (error) {
            throw error;
        }
    }
}

    async getUser() {
        const {
            data: { user },
        } = await this.supabase.auth.getUser();

        return user;
    }

    async getSession() {
        const {
            data: { session },
        } = await this.supabase.auth.getSession();

        return session;
    }
}

export const authService =
    new AuthService();