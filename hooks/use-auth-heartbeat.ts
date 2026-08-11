"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
    authClientService,
} from "@/services/auth-client.service";

interface UseAuthHeartbeatOptions {
    enabled: boolean;
    onSessionInvalid: (
        message: string
    ) => void | Promise<void>;
}

const SESSION_MESSAGE_KEY =
    "mathster_session_message";

export function useAuthHeartbeat({
    enabled,
    onSessionInvalid,
}: UseAuthHeartbeatOptions) {
    const pathname = usePathname();

    useEffect(() => {
        /*
         * ==========================================
         * KHÔNG CHẠY HEARTBEAT Ở LOGIN
         * ==========================================
         */
        if (
            !enabled ||
            pathname === "/login"
        ) {
            return;
        }

        let stopped = false;

        /*
         * ==========================================
         * LƯU THÔNG BÁO
         * ==========================================
         */
        function saveSessionMessage(
            message: string
        ) {
            sessionStorage.setItem(
                SESSION_MESSAGE_KEY,
                message
            );
        }

        /*
         * ==========================================
         * FORCE LOGOUT
         * ==========================================
         *
         * Heartbeat KHÔNG tự logout.
         *
         * Nó chỉ:
         *
         * 1. Dừng heartbeat
         * 2. Lưu thông báo
         * 3. Báo cho AuthProvider
         */
        function forceLogin(
            message: string
        ) {
            if (stopped) {
                return;
            }

            stopped = true;

            saveSessionMessage(
                message
            );

            console.warn(
                "[HEARTBEAT] Session invalid:",
                message
            );

            /*
             * AuthProvider sẽ chịu trách nhiệm:
             *
             * - logout Supabase
             * - setUser(null)
             * - clear profile cache
             * - chuyển /login
             */
            void onSessionInvalid(
                message
            );
        }

        /*
         * ==========================================
         * HEARTBEAT
         * ==========================================
         */
        async function heartbeat() {
            if (stopped) {
                return;
            }

            try {
                console.log(
                    "[HEARTBEAT] Checking session:",
                    new Date().toISOString()
                );

                await authClientService.heartbeat();

                if (stopped) {
                    return;
                }

                console.log(
                    "[HEARTBEAT] Session valid:",
                    new Date().toISOString()
                );

            } catch (error) {
                if (stopped) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : String(error);

                console.error(
                    "[HEARTBEAT] ERROR:",
                    message
                );

                /*
                 * ======================================
                 * SESSION REPLACED
                 * ======================================
                 */
                if (
                    message.includes(
                        "SESSION_REPLACED"
                    )
                ) {
                    forceLogin(
                        "Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác."
                    );

                    return;
                }

                /*
                 * ======================================
                 * SESSION NOT FOUND
                 * ======================================
                 */
                if (
                    message.includes(
                        "SESSION_NOT_FOUND"
                    )
                ) {
                    forceLogin(
                        "Phiên đăng nhập của bạn không còn tồn tại. Vui lòng đăng nhập lại."
                    );

                    return;
                }

                /*
                 * ======================================
                 * ACCOUNT DISABLED
                 * ======================================
                 */
                if (
                    message.includes(
                        "ACCOUNT_DISABLED"
                    )
                ) {
                    forceLogin(
                        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ giáo viên."
                    );

                    return;
                }

                /*
                 * ======================================
                 * LỖI KHÁC
                 * ======================================
                 */
                console.error(
                    "[HEARTBEAT] Unknown error:",
                    error
                );
            }
        }

        /*
         * ==========================================
         * CHẠY HEARTBEAT NGAY LẬP TỨC
         * ==========================================
         */
        void heartbeat();

        /*
         * ==========================================
         * CHẠY MỖI 60 GIÂY
         * ==========================================
         */
        const interval =
            window.setInterval(
                () => {
                    void heartbeat();
                },
                60 * 1000
            );

        /*
         * ==========================================
         * CLEANUP
         * ==========================================
         */
        return () => {
            stopped = true;

            window.clearInterval(
                interval
            );
        };

    }, [
        enabled,
        pathname,
        onSessionInvalid,
    ]);
}