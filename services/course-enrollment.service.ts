import {
  courseEnrollmentRepository,
  CreateCourseEnrollmentDto,
} from "@/repositories/course-enrollment.repository";

export class CourseEnrollmentService {
  getStudents(courseId: string) {
    return courseEnrollmentRepository.getStudents(courseId);
  }

  getCourses(studentId: string) {
    return courseEnrollmentRepository.getCourses(studentId);
  }

  getById(id: string) {
    return courseEnrollmentRepository.getById(id);
  }

  enroll(values: CreateCourseEnrollmentDto) {
    return courseEnrollmentRepository.enroll(values);
  }

  updateStatus(
    id: string,
    status: CreateCourseEnrollmentDto["status"]
  ) {
    return courseEnrollmentRepository.updateStatus(
      id,
      status
    );
  }

  complete(id: string) {
    return courseEnrollmentRepository.complete(id);
  }

  remove(id: string) {
    return courseEnrollmentRepository.remove(id);
  }
}

export const courseEnrollmentService =
  new CourseEnrollmentService();