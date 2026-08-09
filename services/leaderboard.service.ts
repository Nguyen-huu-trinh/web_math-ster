import {
  leaderboardRepository,
} from "@/repositories/leaderboard.repository";

export class LeaderboardService {

  overall() {
    return leaderboardRepository.overall();
  }

  latest() {
    return leaderboardRepository.latest();
  }

  lazyStudents() {
    return leaderboardRepository.lazyStudents();
  }

  lowHomeworkStudents() {
    return leaderboardRepository.lowHomeworkStudents();
  }

  hardworkingStudents() {
    return leaderboardRepository.hardworkingStudents();
  }

  excellentStudents() {
    return leaderboardRepository.excellentStudents();
  }

  rewardMoneyStudents() {
    return leaderboardRepository.rewardMoneyStudents();
}

dotrauStudents() {
    return leaderboardRepository.doTrauStudents();
}
}

export const leaderboardService =
  new LeaderboardService();