import {
  exerciseRepository,
  CreateExerciseDto,
} from "@/repositories/exercise.repository";

export class ExerciseService {
  getByLesson(lessonId: string) {
    return exerciseRepository.getByLesson(
      lessonId
    );
  }

  getById(id: string) {
    return exerciseRepository.getById(id);
  }

  create(values: CreateExerciseDto) {
    return exerciseRepository.create(values);
  }

  update(
    id: string,
    values: Partial<CreateExerciseDto>
  ) {
    return exerciseRepository.update(id, values);
  }

  delete(id: string) {
    return exerciseRepository.delete(id);
  }

  publish(id: string) {
    return exerciseRepository.publish(id);
  }

  unpublish(id: string) {
    return exerciseRepository.unpublish(id);
  }
}

export const exerciseService =
  new ExerciseService();