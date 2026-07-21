import {
  chapterRepository,
  CreateChapterDto,
} from "@/repositories/chapter.repository";

export class ChapterService {
  getByCourse(courseId: string) {
    return chapterRepository.getByCourse(courseId);
  }

  getById(id: string) {
    return chapterRepository.getById(id);
  }

  create(values: CreateChapterDto) {
    if (!values.title.trim()) {
      throw new Error("Chapter title is required");
    }

    return chapterRepository.create(values);
  }

  update(
    id: string,
    values: Partial<CreateChapterDto>
  ) {
    return chapterRepository.update(id, values);
  }

  delete(id: string) {
    return chapterRepository.delete(id);
  }

  restore(id: string) {
    return chapterRepository.restore(id);
  }

  reorder(
    id: string,
    order: number
  ) {
    return chapterRepository.reorder(
      id,
      order
    );
  }
}

export const chapterService =
  new ChapterService();