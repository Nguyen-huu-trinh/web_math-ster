import { studentExamRepository } from "@/repositories/student-exam.repository";

export class StudentExamService {

  async getMyExams(
    studentId: string
  ) {
    return studentExamRepository.getMyExams(
      studentId
    );
  }

  async startExam(
    examId: string,
    studentId: string
  ) {
    return studentExamRepository.startExam(
      examId,
      studentId
    );
  }

  /**
   * Lấy toàn bộ dữ liệu để resume bài thi
   */
  async getExamSession(
    studentId: string,
    attemptId: string
  ) {
    return studentExamRepository.getAttemptDetail(
      studentId,
      attemptId
    );
  }

async adjustStudentPoints(
  examId: string,
  studentId: string,
  action: "increase" | "decrease"
) {
  return studentExamRepository.adjustStudentPoints(
    examId,
    studentId,
    action
  );
}



  async getTeacherExamSession(
  attemptId: string
) {
  return studentExamRepository.getTeacherAttemptDetail(
    attemptId
  );
}

  async submitAttempt(
    studentId: string,
    attemptId: string,
    answers: Record<string, any>
  ) {
    return studentExamRepository.submitAttempt(
      studentId,
      attemptId,
      answers
    );
  }

}

export const studentExamService =
  new StudentExamService();