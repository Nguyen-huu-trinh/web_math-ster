import {
  videoRepository,
  CreateVideoDto,
} from "@/repositories/video.repository";

export class VideoService {
  getByLesson(lessonId: string) {
    return videoRepository.getByLesson(
      lessonId
    );
  }

  getById(id: string) {
    return videoRepository.getById(id);
  }

  create(values: CreateVideoDto) {
    return videoRepository.create(values);
  }

  update(
    id: string,
    values: Partial<CreateVideoDto>
  ) {
    return videoRepository.update(id, values);
  }

  delete(id: string) {
    return videoRepository.delete(id);
  }
}

export const videoService =
  new VideoService();