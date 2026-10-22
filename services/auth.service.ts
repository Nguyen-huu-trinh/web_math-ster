import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface LoginDto {
    email: string;
    password: string;
}

class AuthService {
    private supabase = createClient();
    private userRequest: Promise<User | null> | null = null;

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

    getUser(): Promise<User | null> {
        // Share only concurrent checks (e.g. Strict Mode mounts), never cache
        // a completed identity check across users or requests.
        if (!this.userRequest) {
            this.userRequest = this.supabase.auth.getUser()
                .then(({ data }) => data.user)
                .finally(() => { this.userRequest = null; });
        }
        return this.userRequest;
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
