import { courseRepository, type CreateCourseDto } from "@/repositories/course.repository";

// React Query handles client caching; read current data for every server request.
class CourseService {
  getAll(studentId?: string) { return courseRepository.getAll(studentId); }
  getById(id: string) { return courseRepository.getById(id); }
  create(data: CreateCourseDto) { return courseRepository.create(data); }
  update(id: string, data: Partial<CreateCourseDto>) { return courseRepository.update(id, data); }
  delete(id: string) { return courseRepository.delete(id); }
  restore(id: string) { return courseRepository.restore(id); }
}

export const courseService = new CourseService();
