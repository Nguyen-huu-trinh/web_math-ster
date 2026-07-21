import {
  studentAnswerRepository,
  CreateStudentAnswerDto,
} from "@/repositories/student-answer.repository";

export class StudentAnswerService {
  getByAttempt(
    attemptId: string
  ) {
    return studentAnswerRepository.getByAttempt(
      attemptId
    );
  }

  save(
    values: CreateStudentAnswerDto
  ) {
    return studentAnswerRepository.save(
      values
    );
  }

  delete(id: string) {
    return studentAnswerRepository.delete(
      id
    );
  }

  deleteByAttempt(
    attemptId: string
  ) {
    return studentAnswerRepository.deleteByAttempt(
      attemptId
    );
  }
}

export const studentAnswerService =
  new StudentAnswerService();