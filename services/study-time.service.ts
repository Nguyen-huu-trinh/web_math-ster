import {
  studyTimeRepository,
  UpdateStudyTimeDto,
} from "@/repositories/study-time.repository";

export class StudyTimeService {
  addTime(values: UpdateStudyTimeDto) {
    return studyTimeRepository.addTime(values);
  }

  getDaily(studentId: string) {
    return studyTimeRepository.getDaily(studentId);
  }

  getToday(studentId: string) {
    return studyTimeRepository.getToday(studentId);
  }

  getTotal(studentId: string) {
    return studyTimeRepository.getTotal(studentId);
  }

  leaderboard() {
    return studyTimeRepository.leaderboard();
  }
}

export const studyTimeService =
  new StudyTimeService();