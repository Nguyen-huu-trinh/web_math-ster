import {

leaderboardRepository

}

from "@/repositories/leaderboard.repository";

export class LeaderboardService{

    overall(){

        return leaderboardRepository.overall();

    }

    latest(){

        return leaderboardRepository.latest();

    }

}

export const leaderboardService=

new LeaderboardService();