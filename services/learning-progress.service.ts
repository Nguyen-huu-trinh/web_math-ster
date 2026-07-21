import {
    learningProgressRepository,
    UpdateLearningProgressDto,
} from "@/repositories/learning-progress.repository";

export class LearningProgressService {

    getStudentProgress(studentId: string) {
        return learningProgressRepository.getStudentProgress(studentId);
    }

    getLessonProgress(
        studentId: string,
        lessonId: string
    ) {
        return learningProgressRepository.getLessonProgress(
            studentId,
            lessonId
        );
    }

    save(values: UpdateLearningProgressDto) {
        return learningProgressRepository.save(values);
    }

    complete(id: string) {
        return learningProgressRepository.complete(id);
    }
}

export const learningProgressService =
    new LearningProgressService();