import {
    teacherStudentRepository,
    UpdateTeacherStudentInput,
} from "@/repositories/teacher-student.repository";

export class TeacherStudentService {

    async getAll() {
        return teacherStudentRepository.getAll();
    }

    async getByCourse(
        courseId: string
    ) {
        return teacherStudentRepository.getByCourse(
            courseId
        );
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

    async enable(studentId: string) {
        return teacherStudentRepository.enable(
            studentId
        );
    }

    async updateFinancialInfo(
        studentId: string,
        values: {
            points?: number;
            rewardMoney?: number;
        }
    ) {
        return teacherStudentRepository
            .updateFinancialInfo(
                studentId,
                values
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

addToCourse(courseId: string, studentIds: string[]) {
    return teacherStudentRepository.addToCourse(
        courseId,
        studentIds
    );
}

    async removeFromCourse(
        courseId: string,
        studentId: string
    ) {
        return teacherStudentRepository.removeFromCourse(
            courseId,
            studentId
        );
    }
}

export const teacherStudentService =
    new TeacherStudentService();