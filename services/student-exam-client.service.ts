import { apiClient } from "@/lib/api/client";

export interface StudentExamItem {
  id: string;

  title: string;

  description: string | null;

  category: string;

  examType: string;

  duration: number;

  courseId: string;

  courseName: string;

  attempts: number;

  maxAttempts: number;

  lastScore: number | null;

  lastAttemptAt: string | null;

  status:
    | "NOT_STARTED"
    | "PASSED"
    | "FAILED"
    | "DONE";

  canStart: boolean;

  canRetake: boolean;

  attendanceMinScore: number | null;

  showAnswer: boolean;

  examFile: string;
  
  lastAttemptId?: string | null;
}

class StudentExamClientService {
  getMyExams() {
    return apiClient.get<StudentExamItem[]>(
      "/api/students/my-exams"
    );
  }

  startExam(id: string) {
  return apiClient.post<{
    id: string;
  }>(
    `/api/students/my-exams/${id}/start`
  );
}
}


export const studentExamClientService =
  new StudentExamClientService();