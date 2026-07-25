import {
  chapterRepository,
  CreateChapterDto,
} from "@/repositories/chapter.repository";

class ChapterService {
  getByCourse(courseId: string) {
    return chapterRepository.getByCourse(courseId);
  }

  create(data: CreateChapterDto) {
    return chapterRepository.create(data);
  }

  update(
    id: string,
    data: Partial<CreateChapterDto>
  ) {
    return chapterRepository.update(id, data);
  }

  delete(id: string) {
    return chapterRepository.delete(id);
  }
}

export const chapterService =
  new ChapterService();