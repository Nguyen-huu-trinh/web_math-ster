import {
  videoWatchRepository,
  UpdateVideoWatchDto,
} from "@/repositories/video-watch.repository";

export class VideoWatchService {
  getStudentVideos(studentId: string) {
    return videoWatchRepository.getStudentVideos(
      studentId
    );
  }

  getVideoProgress(
    studentId: string,
    videoId: string
  ) {
    return videoWatchRepository.getVideoProgress(
      studentId,
      videoId
    );
  }

  save(values: UpdateVideoWatchDto) {
    return videoWatchRepository.save(values);
  }

  complete(id: string) {
    return videoWatchRepository.complete(id);
  }
}

export const videoWatchService =
  new VideoWatchService();