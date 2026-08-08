"use client";

import { useEffect } from "react";

import { authService } from "@/services/auth.service";

import {
    authClientService,
} from "@/services/auth-client.service";


export function useAuthHeartbeat(
    enabled: boolean
) {

    useEffect(() => {

        if (!enabled) {
            return;
        }

        let stopped = false;

        async function heartbeat() {

            if (stopped) {
                return;
            }

            try {

                await authClientService.heartbeat();

            } catch (error) {

                /*
                 * =====================================================
                 * SESSION BỊ THIẾT BỊ KHÁC THAY THẾ
                 * =====================================================
                 */

                const message =
                    error instanceof Error
                        ? error.message
                        : String(error);

                if (
                    message.includes(
                        "SESSION_REPLACED"
                    )
                ) {

                    console.warn(
                        "Phiên đăng nhập đã bị thay thế."
                    );

                    stopped = true;

                    /*
                     * Logout Supabase.
                     */
                    try {

                        await authService.logout();

                    } catch (
                        logoutError
                    ) {

                        console.error(
                            "Logout failed:",
                            logoutError
                        );

                    }

                    /*
                     * Đưa người dùng về Login.
                     */
                    window.location.replace(
                        "/login"
                    );

                    return;
                }


                /*
                 * =====================================================
                 * SESSION KHÔNG TỒN TẠI
                 * =====================================================
                 */

                if (
                    message.includes(
                        "SESSION_NOT_FOUND"
                    )
                ) {

                    stopped = true;

                    try {

                        await authService.logout();

                    } catch {}

                    window.location.replace(
                        "/login"
                    );

                    return;
                }


                /*
                 * =====================================================
                 * ACCOUNT BỊ KHÓA
                 * =====================================================
                 */

                if (
                    message.includes(
                        "ACCOUNT_DISABLED"
                    )
                ) {

                    stopped = true;

                    try {

                        await authService.logout();

                    } catch {}

                    window.location.replace(
                        "/login"
                    );

                    return;
                }


                /*
                 * Các lỗi heartbeat khác.
                 */

                console.error(
                    "Heartbeat failed:",
                    error
                );
            }
        }


        /*
         * Heartbeat ngay khi bắt đầu.
         */
        void heartbeat();


        /*
         * Heartbeat mỗi 60 giây.
         */
        const interval =
            window.setInterval(
                () => {
                    void heartbeat();
                },
                60 * 1000
            );


        return () => {

            stopped = true;

            window.clearInterval(
                interval
            );

        };

    }, [enabled]);
}