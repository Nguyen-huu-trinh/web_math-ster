import { NextRequest }

from "next/server";

import {

success

}

from "@/lib/api/api-response";

import {

handleError

}

from "@/lib/api/handle-error";

import {

createClient

}

from "@/lib/supabase/server";

interface Props{

params:Promise<{

id:string

}>

}

export async function PATCH(

request:NextRequest,

{params}:Props

){

try{

const {id}=await params;

const supabase=

await createClient();

await supabase

.from("user_notifications")

.update({

is_read:true,

read_at:new Date()

})

.eq("id",id);

return success();

}

catch(error){

return handleError(error);

}

}