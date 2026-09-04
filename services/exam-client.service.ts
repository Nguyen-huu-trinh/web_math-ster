import { apiClient } from "@/lib/api/client";

import {
  AnswerKey,
  CreateExamDto,
  UpdateExamDto,
  Exam,
} from "@/types/exam";

export class ExamClientService {

  async upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/exams/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json() as Promise<{ url: string }>;
  }

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

 deactivate(id: string) {
  return apiClient.post(
    `/api/exams/${id}/deactivate`,
    {}
  );
}

  getPrerequisites(id: string) {
    return apiClient.get(
      `/api/exams/${id}/prerequisites`
    );
  }

  addPrerequisite(
    examId: string,
    prerequisiteExamId: string
  ) {
    return apiClient.post(
      `/api/exams/${examId}/prerequisites`,
      {
        prerequisiteExamId,
      }
    );
  }

  removePrerequisite(
    examId: string,
    prerequisiteExamId: string
  ) {
    return apiClient.delete(
      `/api/exams/${examId}/prerequisites/${prerequisiteExamId}`
    );
  }

}
export const examClientService =
  new ExamClientService();
