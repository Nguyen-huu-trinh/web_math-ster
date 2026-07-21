import {

success

}

from "@/lib/api/api-response";

import {

handleError

}

from "@/lib/api/handle-error";

import {

leaderboardService

}

from "@/services/leaderboard.service";

export async function GET(){

try{

return success(

await leaderboardService.overall()

);

}

catch(error){

return handleError(error);

}

}