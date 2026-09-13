import { leaderboardRepository } from "@/repositories/leaderboard.repository";
import { cache } from "react";

export class LeaderboardService {

  // Dùng React cache để deduplicate request trong cùng 1 lần render
  overall = cache(() => {
    return leaderboardRepository.overall();
  });

  latest = cache(() => {
    return leaderboardRepository.latest();
  });

  lazyStudents = cache(() => {
    return leaderboardRepository.lazyStudents();
  });

  lowHomeworkStudents = cache(() => {
    return leaderboardRepository.lowHomeworkStudents();
  });

  hardworkingStudents = cache(() => {
    return leaderboardRepository.hardworkingStudents();
  });

  excellentStudents = cache(() => {
    return leaderboardRepository.excellentStudents();
  });

  rewardMoneyStudents = cache(() => {
    return leaderboardRepository.rewardMoneyStudents();
  });

  dotrauStudents = cache(() => {
    return leaderboardRepository.doTrauStudents();
  });
}

export const leaderboardService = new LeaderboardService();