import {
  lessonContentRepository,
  CreateLessonContentDto,
  UpdateLessonContentDto,
} from "@/repositories/lesson-content.repository";

class LessonContentService {
  getByLesson(lessonId: string) {
    return lessonContentRepository.getByLesson(lessonId);
  }

  create(values: CreateLessonContentDto) {
    return lessonContentRepository.create(values);
  }

  update(
    id: string,
    values: UpdateLessonContentDto
  ) {
    return lessonContentRepository.update(id, values);
  }

  delete(id: string) {
    return lessonContentRepository.delete(id);
  }
}

export const lessonContentService =
  new LessonContentService();