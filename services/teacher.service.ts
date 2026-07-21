import {
  teacherRepository,
  CreateTeacherDto,
  UpdateTeacherDto,
} from "@/repositories/teacher.repository";

export class TeacherService {
  getAll() {
    return teacherRepository.getAll();
  }

  getById(id: string) {
    return teacherRepository.getById(id);
  }

  create(values: CreateTeacherDto) {
    return teacherRepository.create(values);
  }

  update(
    id: string,
    values: UpdateTeacherDto
  ) {
    return teacherRepository.update(id, values);
  }

  activate(id: string) {
    return teacherRepository.activate(id);
  }

  deactivate(id: string) {
    return teacherRepository.deactivate(id);
  }

  remove(id: string) {
    return teacherRepository.softDelete(id);
  }
}

export const teacherService =
  new TeacherService();