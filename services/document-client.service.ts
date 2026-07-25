import { api } from "@/lib/api";
import { LessonDocument } from "@/types/document";

class DocumentClientService {
  getByLesson(lessonId: string) {
    return api<LessonDocument[]>(
      `/api/documents?lessonId=${lessonId}`
    );
  }
}

export const documentClientService =
  new DocumentClientService();