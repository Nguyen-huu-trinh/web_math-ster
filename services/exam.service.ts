import { examRepository } from "@/repositories/exam.repository";

import {
  AnswerKey,
  CreateExamDto,
  UpdateExamDto,
} from "@/types/exam";

export class ExamService {

  // =========================
  // Query
  // =========================

  async getAll() {
    return examRepository.getAll();
  }

  async getById(id: string) {
    return examRepository.getById(id);
  }

  async getAnswerKey(id: string) {
    return examRepository.getAnswerKey(id);
  }

  // =========================
  // Commands
  // =========================

  async create(
    teacherId: string,
    values: CreateExamDto
  ) {
    return examRepository.create(
      teacherId,
      values
    );
  }

  async update(
    id: string,
    values: UpdateExamDto
  ) {
    return examRepository.update(
      id,
      values
    );
  }

  async updateAnswerKey(
    id: string,
    answerKey: AnswerKey
  ) {
    return examRepository.updateAnswerKey(
      id,
      answerKey
    );
  }

  async activate(id: string) {
    return examRepository.activate(id);
  }

  async deactivate(id: string) {
    return examRepository.deactivate(id);
  }

  async duplicate(
    id: string,
    teacherId: string
  ) {
    return examRepository.duplicate(
      id,
      teacherId
    );
  }

  async softDelete(id: string) {
    return examRepository.softDelete(id);
  }

}

export const examService =
  new ExamService();