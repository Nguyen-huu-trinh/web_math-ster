import {
    teacherStudentRepository,
    UpdateTeacherStudentInput,
} from "@/repositories/teacher-student.repository";

export class TeacherStudentService {

    async getAll() {
        return teacherStudentRepository.getAll();
    }

    async getById(
        studentId: string
    ) {
        return teacherStudentRepository.getById(
            studentId
        );
    }

    async update(
        studentId: string,
        values: UpdateTeacherStudentInput
    ) {
        return teacherStudentRepository.update(
            studentId,
            values
        );
    }

    async disable(
        studentId: string
    ) {
        return teacherStudentRepository.disable(
            studentId
        );
    }

    async delete(
        studentId: string
    ) {
        return teacherStudentRepository.delete(
            studentId
        );
    }

    async deleteAttempt(
        studentId: string,
        attemptId: string
    ) {
        return teacherStudentRepository.deleteAttempt(
            studentId,
            attemptId
        );
    }
}

export const teacherStudentService =
    new TeacherStudentService();