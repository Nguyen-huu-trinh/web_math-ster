import { createClient } from "@/lib/supabase/server";

export interface AuditDto{

    user_id?:string;

    action:string;

    entity:string;

    entity_id?:string;

    description?:string;

    old_data?:unknown;

    new_data?:unknown;

    ip_address?:string;

    user_agent?:string;

}

export class AuditRepository{

    async create(data:AuditDto){

        const supabase=await createClient();

        const {error}=await supabase
            .from("audit_logs")
            .insert(data);

        if(error) throw error;

    }

    async findAll(){

        const supabase=await createClient();

        const {data,error}=await supabase

        .from("audit_logs")

        .select("*")

        .order("created_at",{

            ascending:false

        });

        if(error) throw error;

        return data;

    }

    async findByUser(userId:string){

        const supabase=await createClient();

        const {data,error}=await supabase

        .from("audit_logs")

        .select("*")

        .eq("user_id",userId)

        .order("created_at",{

            ascending:false

        });

        if(error) throw error;

        return data;

    }

}

export const auditRepository=
new AuditRepository();