import {

success

}

from "@/lib/api/api-response";

import {

handleError

}

from "@/lib/api/handle-error";

import {

dashboardLeaderboardService

}

from "@/services/dashboard-leaderboard.service";

export async function GET(){

try{

return success(

await dashboardLeaderboardService.dashboard()

);

}

catch(error){

return handleError(error);

}

}