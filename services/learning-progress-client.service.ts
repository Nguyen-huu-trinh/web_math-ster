import { api } from "@/lib/api";
import { LearningProgress } from "@/types/learning-progress";

export interface UpdateLearningProgressDto {
  student_id: string;
  lesson_id: string;
  progress_percent: number;
  watched_seconds?: number;
  study_seconds?: number;
  completed?: boolean;
}

class LearningProgressClientService {
  getStudentProgress(studentId: string) {
    return api<LearningProgress[]>(
      `/api/learning-progress?studentId=${studentId}`
    );
  }

  save(values: UpdateLearningProgressDto) {
    return api<LearningProgress>(
      "/api/learning-progress",
      {
        method: "POST",
        body: JSON.stringify(values),
      }
    );
  }

  complete(id: string) {
    return api<LearningProgress>(
      `/api/learning-progress/${id}`,
      {
        method: "PATCH",
      }
    );
  }
}

export const learningProgressClientService =
  new LearningProgressClientService();