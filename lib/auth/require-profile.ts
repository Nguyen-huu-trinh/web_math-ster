import { cache } from "react";
import { getServerSupabase } from "./auth-context";
import { requireAuth } from "./require-auth";

export const requireProfile = cache(async () => {

    const user =
        await requireAuth();

    const supabase =
        await getServerSupabase();

    const { data, error } =
        await supabase
            .from("profiles")
            .select(`
                id,
                role,
                full_name,
                email,
                student_code,
                avatar_url,
                is_active
            `)
            .eq("id", user.id)
            .single();

    if (error || !data) {
        throw new Error("Profile not found");
    }

    return data;
});