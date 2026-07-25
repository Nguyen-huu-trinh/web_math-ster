"use client";

import { useEffect, useState } from "react";

import { authService } from "@/services/auth.service";

import { profileRepository } from "@/repositories/profile.repository";

export function useAuth() {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const currentUser =
      await authService.getUser();

    if (!currentUser) {
      setLoading(false);
      return;
    }

    const currentProfile =
      await profileRepository.getProfile(
        currentUser.id
      );

    setUser(currentUser);

    setProfile(currentProfile);

    setLoading(false);
  }

  return {
    user,
    profile,
    loading,
  };
}