import { studentRulesRepository } from "@/repositories/student-rules.repository";

export class StudentRulesService {
  async getAll() {
    return studentRulesRepository.getAll();
  }

  async create(data: {
    title: string;
    content: string;
  }) {
    return studentRulesRepository.create(
      data
    );
  }

  async update(
    id: string,
    data: {
      title: string;
      content: string;
    }
  ) {
    return studentRulesRepository.update(
      id,
      data
    );
  }

  async remove(id: string) {
    return studentRulesRepository.remove(
      id
    );
  }
}

export const studentRulesService =
  new StudentRulesService();