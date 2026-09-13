import { courseDetailRepository } from "@/repositories/course-detail.repository";

class CourseDetailService {
  /**
   * Lấy chi tiết khóa học và tự động sắp xếp thứ tự Chương / Bài học
   */
  async getCourseDetail(courseId: string, studentId?: string) {
    const course = await courseDetailRepository.get(courseId, studentId);

    if (!course) return null;

    // Tối ưu: Sắp xếp sẵn order_index cho các chương và bài học tại Server/Service
    // để tránh Client phải sort lại trên mỗi lần re-render
    const sortedChapters = course.chapters
      ?.sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((chapter: any) => ({
        ...chapter,
        lessons: chapter.lessons?.sort(
          (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
        ),
      }));

    return {
      ...course,
      chapters: sortedChapters ?? [],
    };
  }
}

export const courseDetailService = new CourseDetailService();