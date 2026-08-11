import { apiClient } from "@/lib/api/client";

export interface TeacherStudentListItem {
    id: string;
    fullName: string;
    studentCode: string;
    email: string;
    personalEmail: string | null;
    avatarUrl: string | null;
    points: number;
    rewardMoney: number;
    averageScore: number;
    isActive: boolean;
    learningGoal: string | null;
}

export interface TeacherStudentAttempt {
    id: string;
    attemptNumber: number;
    score: number | null;
    startedAt: string | null;
    submittedAt: string | null;
    createdAt: string | null;
}

export interface TeacherStudentExam {
    id: string;
    title: string;
    category: string;
    duration: number;
    attempts: TeacherStudentAttempt[];
}

export interface TeacherStudentDetail {
    profile: {
        id: string;
        fullName: string;
        studentCode: string;
        email: string;
        personalEmail: string | null;
        avatarUrl: string | null;
        points: number;
        rewardMoney: number;
        learningGoal: string | null;
        isActive: boolean;
    };

    statistics: {
        averageScore: number;
        pendingExams: number;
        incompleteLessons: number;
    };

    exams: TeacherStudentExam[];
}

export class TeacherStudentClientService {

    getAll() {
        return apiClient.get<
            TeacherStudentListItem[]
        >(
            "/api/teachers/students"
        );
    }

    getById(id: string) {
        return apiClient.get<
            TeacherStudentDetail
        >(
            `/api/teachers/students/${id}`
        );
    }

    update(
        id: string,
        values: {
            personalEmail?: string | null;
            points?: number;
            rewardMoney?: number;
        }
    ) {
        return apiClient.patch(
            `/api/teachers/students/${id}`,
            values
        );
    }

    disable(id: string) {
        return apiClient.post(
            `/api/teachers/students/${id}/disable`
        );
    }
    enable(id: string) {
        return apiClient.post(
            `/api/teachers/students/${id}/enable`
        );
    }
    delete(id: string) {
        return apiClient.delete(
            `/api/teachers/students/${id}`
        );
    }

    deleteAttempt(
        studentId: string,
        attemptId: string
    ) {
        return apiClient.delete(
            `/api/teachers/students/${studentId}/attempts/${attemptId}`
        );
    }

    updateFinancialInfo(
        studentId: string,
        values: {
            points?: number;
            rewardMoney?: number;
        }
    ) {
        return apiClient.patch(
            `/api/teachers/students/${studentId}/financial`,
            values
        );
    }
}

export const teacherStudentClientService =
    new TeacherStudentClientService();