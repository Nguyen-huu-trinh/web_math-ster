import { success } from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

import { createClient }

from "@/lib/supabase/server";

import {

notificationService

}

from "@/services/notification.service";

export async function GET(){

try{

const supabase=

await createClient();

const {

data:{user}

}=await supabase.auth.getUser();

return success(

await notificationService.myNotifications(

user!.id

)

);

}

catch(error){

return handleError(error);

}

}