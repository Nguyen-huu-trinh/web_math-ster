import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getServerSupabase = cache(async () => {
    return await createClient();
});