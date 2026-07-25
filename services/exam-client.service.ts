import { apiClient } from "@/lib/api/client";

import {
  AnswerKey,
  CreateExamDto,
  UpdateExamDto,
  Exam,
} from "@/types/exam";

export class ExamClientService {

  getAll() {
    return apiClient.get<Exam[]>(
      "/api/exams"
    );
  }

  getById(id: string) {
    return apiClient.get<Exam>(
      `/api/exams/${id}`
    );
  }

  create(values: CreateExamDto) {
    return apiClient.post<Exam>(
      "/api/exams",
      values
    );
  }

  update(
    id: string,
    values: UpdateExamDto
  ) {
    return apiClient.put<Exam>(
      `/api/exams/${id}`,
      values
    );
  }

  delete(id: string) {
    return apiClient.delete<void>(
      `/api/exams/${id}`
    );
  }

  duplicate(id: string) {
    return apiClient.post<Exam>(
      `/api/exams/${id}/duplicate`,
      {}
    );
  }

  getAnswerKey(id: string) {
    return apiClient.get<AnswerKey>(
      `/api/exams/${id}/answer-key`
    );
  }

  updateAnswerKey(
    id: string,
    answerKey: AnswerKey
  ) {
    return apiClient.put(
      `/api/exams/${id}/answer-key`,
      answerKey
    );
  }

  publish(id: string) {
    return apiClient.post(
      `/api/exams/${id}/publish`,
      {}
    );
  }

  close(id: string) {
    return apiClient.post(
      `/api/exams/${id}/close`,
      {}
    );
  }

}

export const examClientService =
  new ExamClientService();