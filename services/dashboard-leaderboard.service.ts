import {
  leaderboardService,
} from "./leaderboard.service";

export class DashboardLeaderboardService {

  async dashboard() {

    const [

      overall,

      latest,

      lazy,

      lowHomework,

      hardworking,

      excellent,

      rewardMoney,

      dotrau,

    ] = await Promise.all([

      leaderboardService.overall(),

      leaderboardService.latest(),

      leaderboardService.lazyStudents(),

      leaderboardService.lowHomeworkStudents(),

      leaderboardService.hardworkingStudents(),

      leaderboardService.excellentStudents(),

      leaderboardService.rewardMoneyStudents(),

      leaderboardService.dotrauStudents(),


    ]);

    return {

      overall,

      latest,

      lazy,

      lowHomework,

      hardworking,

      excellent,

      rewardMoney,

      dotrau,
    };

  }

}

export const dashboardLeaderboardService =
  new DashboardLeaderboardService();