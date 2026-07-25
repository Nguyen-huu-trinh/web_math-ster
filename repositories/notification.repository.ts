import { createClient } from "@/lib/supabase/client";

export interface CreateNotificationDto{

    title:string;

    message:string;

    type:string;

    sender_id?:string;

}

export class NotificationRepository{

    async create(data:CreateNotificationDto){

        const supabase=await createClient();

        const {data:result,error}=await supabase

        .from("notifications")

        .insert(data)

        .select()

        .single();

        if(error) throw error;

        return result;

    }

    async assign(notificationId:string,userIds:string[]){

        const supabase=await createClient();

        const rows=userIds.map(id=>({

            notification_id:notificationId,

            user_id:id

        }));

        const {error}=await supabase

        .from("user_notifications")

        .insert(rows);

        if(error) throw error;

    }

    async myNotifications(userId:string){

        const supabase=await createClient();

        const {data,error}=await supabase

        .from("user_notifications")

        .select(`
            *,
            notifications(*)
        `)

        .eq("user_id",userId)

        .order("created_at",{

            ascending:false

        });

        if(error) throw error;

        return data;

    }

}
export const notificationRepository=
new NotificationRepository();