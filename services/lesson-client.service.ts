import { api } from "@/lib/api";
import { Lesson } from "@/types/lesson";

export interface CreateLessonDto {
  chapter_id: string;
  title: string;
  description?: string;
  lesson_order: number;
  estimated_minutes?: number;
  is_published?: boolean;
}

class LessonClientService {
  getByChapter(chapterId: string) {
    return api<Lesson[]>(
      `/api/lessons?chapterId=${chapterId}`
    );
  }

  getById(id: string) {
    return api<Lesson>(`/api/lessons/${id}`);
  }

  create(values: CreateLessonDto) {
    return api<Lesson>("/api/lessons", {
      method: "POST",
      body: JSON.stringify(values),
    });
  }

  update(
    id: string,
    values: Partial<CreateLessonDto>
  ) {
    return api<Lesson>(`/api/lessons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });
  }

  async delete(id: string) {
    await api(`/api/lessons/${id}`, {
      method: "DELETE",
    });
  }
}

export const lessonClientService =
  new LessonClientService();