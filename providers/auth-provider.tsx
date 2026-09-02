"use client";

import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useState,
    ReactNode,
} from "react";

import {
    useIdleLogout,
} from "@/hooks/use-idle-logout";

// import {
//     useAuthHeartbeat,
// } from "@/hooks/use-auth-heartbeat";

import { User } from "@supabase/supabase-js";

import {
    authService,
} from "@/services/auth.service";

import {
    AuthContextType,
} from "@/types/auth";

import {
    useProfile,
} from "@/hooks/use-profile";

import {
    useQueryClient,
} from "@tanstack/react-query";

import {
    queryKeys,
} from "@/lib/react-query/query-keys";


const AuthContext =
    createContext<AuthContextType | null>(
        null
    );


export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);
    const [sessionId, setSessionId] =
    useState<string | null>(null);

    const queryClient =
        useQueryClient();

    const pathname =
        usePathname();

    const profileQuery =
        useProfile(user?.id);

    const profile =
        profileQuery.data ?? null;

    const isExamPage =
        pathname.startsWith(
            "/student-exams/"
        );

    const isLoginPage =
        pathname === "/login";

    const userId =
        user?.id;


    /*
     * ==========================================
     * LOGOUT KHI HEARTBEAT PHÁT HIỆN SESSION INVALID
     * ==========================================
     */
    const handleSessionInvalid =
        useCallback(
            async (message?: string) => {

                /*
                 * Lưu userId trước khi
                 * setUser(null).
                 */
                if (message) {
                    sessionStorage.setItem(
                        "mathster_session_message",
                        message
                    );
                }
                const currentUserId =
                    userId;

                /*
                 * Logout Supabase +
                 * application session.
                 */
                try {

                    await authService.logout();

                } catch (error) {

                    console.error(
                        "Forced logout failed:",
                        error
                    );
                }

                /*
                 * Xóa user khỏi React state.
                 */
                setUser(null);

                /*
                 * Xóa profile cache.
                 */
                if (currentUserId) {

                    queryClient.removeQueries({
                        queryKey:
                            queryKeys.profile.detail(
                                currentUserId
                            ),
                    });

                }

                /*
                 * Chuyển về Login.
                 */
                window.location.replace(
                    "/login"
                );

            },
            [
                userId,
                queryClient,
            ]
        );
/*
 * ==========================================
 * REALTIME SESSION
 * ==========================================
 *
 * Phát hiện tài khoản đăng nhập trên
 * thiết bị khác.
 */
useEffect(() => {

    if (
        !userId ||
        !sessionId ||
        isLoginPage
    ) {
        return;
    }

    const supabase =
        createClient();

    const channel =
        supabase
            .channel(
                `profile-session-${userId}`
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${userId}`,
                },
                (payload) => {

                    const newSessionId =
                        payload.new
                            .session_id;

                    if (
                        newSessionId &&
                        newSessionId !==
                            sessionId
                    ) {

                        void handleSessionInvalid("Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác.");

                    }

                }
            )
            .subscribe();

    return () => {

        void supabase.removeChannel(
            channel
        );

    };

}, [
    userId,
    sessionId,
    isLoginPage,
    handleSessionInvalid,
]);

    /*
     * ==========================================
     * HEARTBEAT
     * ==========================================
     */
    // useAuthHeartbeat({

    //     enabled:
    //         Boolean(user) &&
    //         !isLoginPage,

    //     onSessionInvalid:
    //         handleSessionInvalid,

    // });


    /*
     * ==========================================
     * IDLE LOGOUT
     * ==========================================
     *
     * Không chạy ở Login.
     */
    useIdleLogout(
        Boolean(user) &&
        !isExamPage &&
        !isLoginPage
    );


    /*
     * ==========================================
     * REFRESH USER
     * ==========================================
     */
    const refresh =
        useCallback(
            async () => {

                setLoading(true);

                try {

                    const currentUser =
                        await authService.getUser();

                    if (!currentUser) {

                        setUser(null);

                        return;
                    }

                    setUser(
                        currentUser
                    );

                    await queryClient.invalidateQueries({
                        queryKey:
                            queryKeys.profile.detail(
                                currentUser.id
                            ),
                    });

                } catch (error) {

                    console.error(
                        error
                    );

                    setUser(null);

                } finally {

                    setLoading(false);

                }

            },
            [
                queryClient,
            ]
        );


    /*
     * ==========================================
     * INITIAL AUTH CHECK
     * ==========================================
     */
    useEffect(() => {

        void refresh();

    }, [refresh]);


    /*
     * ==========================================
     * LOGIN
     * ==========================================
     */
async function login(
    email: string,
    password: string
) {

    const result =
        await authService.login({
            email,
            password,
        });

    setSessionId(
        result.sessionId
    );

    await refresh();
}


    /*
     * ==========================================
     * MANUAL LOGOUT
     * ==========================================
     */
    async function logout() {

        const currentUserId =
            user?.id;

       await authService.logout();

        setSessionId(null);

        setUser(null);

        if (currentUserId) {

            queryClient.removeQueries({
                queryKey:
                    queryKeys.profile.detail(
                        currentUserId
                    ),
            });

        }

    }


    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                login,
                logout,
                refresh,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }

    return context;
}