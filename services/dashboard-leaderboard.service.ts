import {

leaderboardService

}

from "./leaderboard.service";

export class DashboardLeaderboardService{

    async dashboard(){

        const [

            overall,

            latest

        ]=await Promise.all([

            leaderboardService.overall(),

            leaderboardService.latest()

        ]);

        return{

            overall,

            latest

        };

    }

}

export const dashboardLeaderboardService=

new DashboardLeaderboardService();