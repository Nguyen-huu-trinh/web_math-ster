"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { User } from "@supabase/supabase-js";

import { authService } from "@/services/auth.service";
import { profileClientService } from "@/services/profile-client.service";

import { Profile } from "@/types/profile";
import { AuthContextType } from "@/types/auth";

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {
    setLoading(true);

    try {
      const currentUser =
        await authService.getUser();

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        return;
      }

      const currentProfile =
        await profileClientService.getCurrentProfile();

      setUser(currentUser);
      setProfile(currentProfile);
    } catch (error) {
      console.error(error);

      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

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
    await authService.logout();

    setUser(null);
    setProfile(null);
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