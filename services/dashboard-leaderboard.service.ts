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

    ] = await Promise.all([

      leaderboardService.overall(),

      leaderboardService.latest(),

      leaderboardService.lazyStudents(),

      leaderboardService.lowHomeworkStudents(),

      leaderboardService.hardworkingStudents(),

      leaderboardService.excellentStudents(),

    ]);

    return {

      overall,

      latest,

      lazy,

      lowHomework,

      hardworking,

      excellent,

    };

  }

}

export const dashboardLeaderboardService =
  new DashboardLeaderboardService();