import {
  studentRepository,
  CreateStudentDto,
  UpdateStudentDto,
} from "@/repositories/student.repository";

export class StudentService {
  async getAll() {
    return studentRepository.getAll();
  }

  async getById(id: string) {
    return studentRepository.getById(id);
  }

  async create(data: CreateStudentDto) {
    return studentRepository.create(data);
  }

  async update(
    id: string,
    data: UpdateStudentDto
  ) {
    return studentRepository.update(id, data);
  }

  async activate(id: string) {
    return studentRepository.activate(id);
  }

  async deactivate(id: string) {
    return studentRepository.deactivate(id);
  }

  async remove(id: string) {
    return studentRepository.softDelete(id);
  }

  async getProfile(id: string) {
    return studentRepository.getProfileWithCourses(id);
  }

  async getStatistics(id: string) {
    return studentRepository.getStatistics(id);
  }
}

export const studentService =
  new StudentService();