import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  const profile = data as Profile | null;

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    redirect("/403");
  }

  return {
    user,
    profile,
  };
}

export async function requireAdmin() {
  const { user, profile } = await requireAuth();

  if (profile.role !== "ADMIN") {
    redirect("/403");
  }

  return {
    user,
    profile,
  };
}

export async function requireTeacher() {
  const { user, profile } = await requireAuth();

  if (
    profile.role !== "ADMIN" &&
    profile.role !== "TEACHER"
  ) {
    redirect("/403");
  }

  return {
    user,
    profile,
  };
}

export async function requireStudent() {
  const { user, profile } = await requireAuth();

  if (profile.role !== "STUDENT") {
    redirect("/403");
  }

  return {
    user,
    profile,
  };
}
