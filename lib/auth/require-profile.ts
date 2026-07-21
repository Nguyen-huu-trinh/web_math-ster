import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./require-auth";

export async function requireProfile() {
  const user = await requireAuth();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    throw new Error("Profile not found");
  }

  return data;
}