import { studentExamRepository } from "@/repositories/student-exam.repository";

export class StudentExamService {
  async getMyExams(studentId: string) {
    return studentExamRepository.getMyExams(studentId);
  }
  async startExam(
  examId: string,
  studentId: string
) {
  return studentExamRepository.startExam(
     
    examId,
   studentId,
  );
}
async getAttemptDetail(
  studentId: string,
  attemptId: string
) {
  return studentExamRepository.getAttemptDetail(
    studentId,
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