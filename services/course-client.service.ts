import { apiClient } from "@/lib/api/client";

import type { Course } from "@/types/course";
import type { CreateCourseDto } from "@/repositories/course.repository";

class CourseClientService {
  getAll() {
    return apiClient.get<Course[]>("/api/courses");
  }

  create(data: CreateCourseDto) {
    return apiClient.post<Course>(
      "/api/courses",
      data
    );
  }

  update(
    id: string,
    data: Partial<CreateCourseDto>
  ) {
    return apiClient.put<Course>(
      `/api/courses/${id}`,
      data
    );
  }

  delete(id: string) {
    return apiClient.delete(
      `/api/courses/${id}`
    );
  }

  restore(id: string) {
    return apiClient.post(
      `/api/courses/${id}/restore`
    );
  }
}

export const courseClientService =
  new CourseClientService();