import {
  lessonRepository,
  CreateLessonDto,
} from "@/repositories/lesson.repository";

export class LessonService {
  getByChapter(chapterId: string) {
    return lessonRepository.getByChapter(chapterId);
  }

  getById(id: string) {
    return lessonRepository.getById(id);
  }

  create(values: CreateLessonDto) {
    if (!values.title.trim()) {
      throw new Error("Lesson title is required");
    }

    return lessonRepository.create(values);
  }

  update(
    id: string,
    values: Partial<CreateLessonDto>
  ) {
    return lessonRepository.update(id, values);
  }

  delete(id: string) {
    return lessonRepository.delete(id);
  }

  restore(id: string) {
    return lessonRepository.restore(id);
  }

  publish(id: string) {
    return lessonRepository.publish(id);
  }

  unpublish(id: string) {
    return lessonRepository.unpublish(id);
  }
}

export const lessonService =
  new LessonService();