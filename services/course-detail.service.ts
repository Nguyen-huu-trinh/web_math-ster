import { courseDetailRepository } from "@/repositories/course-detail.repository";

class CourseDetailService {

  getCourseDetail(
    courseId: string,
    studentId?: string
  ) {
    return courseDetailRepository.get(
      courseId,
      studentId
    );
  }

}

export const courseDetailService =
  new CourseDetailService();

export async function getCourseDetail(
  courseId: string,
  studentId?: string
) {
  return courseDetailService.getCourseDetail(
    courseId,
    studentId
  );
}