"use client";

import { useEffect } from "react";

import { authService } from "@/services/auth.service";

const IDLE_TIMEOUT =
    120* 60 * 1000; // 30 phút

export function useIdleLogout(
    enabled: boolean
) {
    useEffect(() => {

        if (!enabled) {
            return;
        }

        let timeoutId:
            ReturnType<typeof setTimeout>;

        let stopped = false;

        async function logout() {

            if (stopped) {
                return;
            }

            stopped = true;

            console.warn(
                "User inactive for 30 minutes. Logging out..."
            );

            try {

                await authService.logout();

            } catch (error) {

                console.error(
                    "Idle logout failed:",
                    error
                );

            } finally {

                window.location.replace(
                    "/login"
                );

            }
        }

        function resetTimer() {

            if (stopped) {
                return;
            }

            clearTimeout(timeoutId);

            timeoutId =
                setTimeout(
                    () => {
                        void logout();
                    },
                    IDLE_TIMEOUT
                );
        }

        /*
         * Các hành động được xem là
         * người dùng đang sử dụng website.
         */
        const events = [
            "mousemove",
            "mousedown",
            "keydown",
            "touchstart",
            "scroll",
        ];

        events.forEach((event) => {

            window.addEventListener(
                event,
                resetTimer,
                {
                    passive: true,
                }
            );

        });

        /*
         * Bắt đầu đếm ngay khi hook được bật.
         */
        resetTimer();

        return () => {

            stopped = true;

            clearTimeout(
                timeoutId
            );

            events.forEach((event) => {

                window.removeEventListener(
                    event,
                    resetTimer
                );

            });

        };

    }, [enabled]);
}