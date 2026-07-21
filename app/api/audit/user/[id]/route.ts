import { NextRequest } from "next/server";

import { success } from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

import { requireAdmin } from "@/lib/auth/admin";

import { auditService } from "@/services/audit.service";

interface Props{

params:Promise<{

id:string

}>

}

export async function GET(

request:NextRequest,

{params}:Props

){

try{

await requireAdmin();

const {id}=await params;

return success(

await auditService.getByUser(id)

);

}

catch(error){

return handleError(error);

}

}