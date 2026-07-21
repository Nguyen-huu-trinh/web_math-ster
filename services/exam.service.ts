import { examRepository } from "@/repositories/exam.repository";
import { questionRepository } from "@/repositories/question.repository";
import { answerRepository } from "@/repositories/answer.repository";

export class ExamService {
  getAll() {
    return examRepository.getAll();
  }

  getById(id: string) {
    return examRepository.getById(id);
  }

  create(values: {
    title: string;
    description?: string;
    exam_type: "FREE" | "MOET";
    exam_category: "ATTENDANCE" | "PERIODIC";
    duration_minutes: number;
    total_score: number;
    max_attempts: number;
  }) {
    return examRepository.create(values);
  }

  update(
    id: string,
    values: Record<string, unknown>
  ) {
    return examRepository.update(id, values);
  }

  open(id: string) {
    return examRepository.open(id);
  }

  lock(id: string) {
    return examRepository.lock(id);
  }

  remove(id: string) {
    return examRepository.softDelete(id);
  }

  restore(id: string) {
    return examRepository.restore(id);
  }

  getQuestions(examId: string) {
    return questionRepository.getByExam(examId);
  }

  getAnswers(questionId: string) {
    return answerRepository.getByQuestion(questionId);
  }
}

export const examService = new ExamService();