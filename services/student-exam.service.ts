import { studentExamRepository } from "@/repositories/student-exam.repository";
import { cache } from "react";

export class StudentExamService {

  // Bọc React cache để tránh query trùng lặp trong 1 request lifecycle
  getMyExams = cache(async (studentId: string) => {
    return studentExamRepository.getMyExams(studentId);
  });

  async startExam(examId: string, studentId: string) {
    return studentExamRepository.startExam(examId, studentId);
  }

  /**
   * Lấy toàn bộ dữ liệu để resume bài thi
   */
  getExamSession = cache(async (studentId: string, attemptId: string) => {
    return studentExamRepository.getAttemptDetail(studentId, attemptId);
  });

  async adjustStudentPoints(
    examId: string,
    studentId: string,
    action: "increase" | "decrease"
  ) {
    return studentExamRepository.adjustStudentPoints(examId, studentId, action);
  }

  getTeacherExamSession = cache(async (attemptId: string) => {
    return studentExamRepository.getTeacherAttemptDetail(attemptId);
  });

  async submitAttempt(
    studentId: string,
    attemptId: string,
    answers: Record<string, any>
  ) {
    return studentExamRepository.submitAttempt(studentId, attemptId, answers);
  }
}

export const studentExamService = new StudentExamService();