import { api } from "@/lib/api";
import { Chapter } from "@/types/chapter";

export interface CreateChapterDto {
  course_id: string;
  title: string;
  description?: string;
  chapter_order: number;
}

class ChapterClientService {
  getByCourse(courseId: string) {
    return api<Chapter[]>(
      `/api/chapters?courseId=${courseId}`
    );
  }

  getById(id: string) {
    return api<Chapter>(`/api/chapters/${id}`);
  }

  create(values: CreateChapterDto) {
    return api<Chapter>("/api/chapters", {
      method: "POST",
      body: JSON.stringify(values),
    });
  }

  update(
    id: string,
    values: Partial<CreateChapterDto>
  ) {
    return api<Chapter>(`/api/chapters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });
  }

  async delete(id: string) {
    await api(`/api/chapters/${id}`, {
      method: "DELETE",
    });
  }
}

export const chapterClientService =
  new ChapterClientService();