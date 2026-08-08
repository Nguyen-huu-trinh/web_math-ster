"use client";

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

import { authService } from "@/services/auth.service";
import { AuthContextType } from "@/types/auth";
import { useProfile } from "@/hooks/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/query-keys";

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const queryClient = useQueryClient();
  const profileQuery = useProfile(user?.id);
  const profile = profileQuery.data ?? null;

useAuthHeartbeat(
    Boolean(user)
);

useIdleLogout(
    Boolean(user)
);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const currentUser =
        await authService.getUser();

      if (!currentUser) {
        setUser(null);
        return;
      }

      setUser(currentUser);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.profile.detail(currentUser.id),
      });
    } catch (error) {
      console.error(error);

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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

  async function logout() {
    const userId = user?.id;

    await authService.logout();

    setUser(null);
    if (userId) {
      queryClient.removeQueries({
        queryKey: queryKeys.profile.detail(userId),
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
