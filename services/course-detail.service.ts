import { courseDetailRepository } from "@/repositories/course-detail.repository";

class CourseDetailService {
  /**
   * Lấy chi tiết khóa học (Dữ liệu đã được sắp xếp tại Repository)
   */
  async getCourseDetail(courseId: string, studentId?: string) {
    const course = await courseDetailRepository.get(courseId, studentId);

    if (!course) return null;

    return course;
  }
}

export const courseDetailService = new CourseDetailService();