import {
  lessonRepository,
  CreateLessonDto,
  UpdateLessonDto,
} from "@/repositories/lesson.repository";

class LessonService {
  async getByChapter(chapterId: string) {
    return await lessonRepository.getByChapter(chapterId);
  }

  async get(id: string) {
    return await lessonRepository.getById(id);
  }

  async create(data: CreateLessonDto) {
    return await lessonRepository.create(data);
  }

  async update(
    id: string,
    data: UpdateLessonDto
  ) {
    return await lessonRepository.update(id, data);
  }

  async delete(id: string) {
    return await lessonRepository.delete(id);
  }
}

export const lessonService = new LessonService();