"use client";

import { usePathname } from "next/navigation";

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

import {
    useAuthHeartbeat,
} from "@/hooks/use-auth-heartbeat";

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
            async () => {

                /*
                 * Lưu userId trước khi
                 * setUser(null).
                 */
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
     * HEARTBEAT
     * ==========================================
     */
    useAuthHeartbeat({

        enabled:
            Boolean(user) &&
            !isLoginPage,

        onSessionInvalid:
            handleSessionInvalid,

    });


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

        await authService.login({
            email,
            password,
        });

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