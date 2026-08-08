import { createClient } from "@/lib/supabase/server";

export class AnnouncementRepository {

    async getActive() {

        const supabase =
            await createClient();

        const { data, error } = await supabase

            .from("announcements")

            .select("*")

            .eq("is_active", true)

            .order("updated_at", {
                ascending: false,
            })

            .limit(1)

            .maybeSingle()

        if (error) throw error;

        return data;

    }

    async update(
        id: string,
        title: string,
        content: string,
    ) {

        const supabase =
            await createClient();

        const { error } = await supabase

            .from("announcements")

            .update({

                title,

                content,

                updated_at: new Date(),

            })

            .eq("id", id);

        if (error) throw error;

    }

}

export const announcementRepository =
new AnnouncementRepository();