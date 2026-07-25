import {
  courseRepository,
  type CreateCourseDto,
} from "@/repositories/course.repository";

class CourseService {
  async getAll() {
    return await courseRepository.getAll();
  }

  async getById(id: string) {
    return await courseRepository.getById(id);
  }

  async create(data: CreateCourseDto) {
    return await courseRepository.create(data);
  }

  async update(
    id: string,
    data: Partial<CreateCourseDto>
  ) {
    return await courseRepository.update(id, data);
  }

  async delete(id: string) {
    return await courseRepository.delete(id);
  }

  async restore(id: string) {
    return await courseRepository.restore(id);
  }
}

export const courseService = new CourseService();