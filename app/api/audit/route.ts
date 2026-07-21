import { success } from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

import { requireAdmin } from "@/lib/auth/admin";

import { auditService } from "@/services/audit.service";

export async function GET(){

    try{

        await requireAdmin();

        return success(

            await auditService.getAll()

        );

    }

    catch(error){

        return handleError(error);

    }

}