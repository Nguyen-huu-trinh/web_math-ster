import { auditService } from "@/services/audit.service";

export async function auditLog({

    userId,

    action,

    entity,

    entityId,

    description,

    oldData,

    newData,

}:{

    userId?:string;

    action:string;

    entity:string;

    entityId?:string;

    description?:string;

    oldData?:unknown;

    newData?:unknown;

}){

    await auditService.create({

        user_id:userId,

        action,

        entity,

        entity_id:entityId,

        description,

        old_data:oldData,

        new_data:newData,

    });

}