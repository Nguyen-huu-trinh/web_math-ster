import { cache } from "react";
import { getServerSupabase } from "./auth-context";

export const requireAuth = cache(async () => {

    const supabase =
        await getServerSupabase();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    return user;
});