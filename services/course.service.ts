import {
  courseRepository,
  CreateCourseDto,
} from "@/repositories/course.repository";

export class CourseService {
  async getAll() {
    return courseRepository.getAll();
  }

  async getById(id: string) {
    const course = await courseRepository.getById(id);

    if (!course) {
      throw new Error("Course not found");
    }

    return course;
  }

  async create(values: CreateCourseDto) {
    if (!values.name.trim()) {
      throw new Error("Course name is required");
    }

    return courseRepository.create(values);
  }

  async update(
    id: string,
    values: Partial<CreateCourseDto>
  ) {
    await this.getById(id);

    return courseRepository.update(id, values);
  }

  async delete(id: string) {
    await this.getById(id);

    return courseRepository.delete(id);
  }

  async restore(id: string) {
    return courseRepository.restore(id);
  }
}

export const courseService =
  new CourseService();