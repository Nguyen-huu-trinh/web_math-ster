import {
  attemptRepository,
  CreateAttemptDto,
} from "@/repositories/attempt.repository";

export class AttemptService {
  async getAllByExam(examId: string) {
    return attemptRepository.getAllByExam(examId);
  }

  async getByUser(userId: string) {
    return attemptRepository.getByUser(userId);
  }

  async getById(id: string) {
    const attempt = await attemptRepository.getById(id);

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    return attempt;
  }

  async start(values: CreateAttemptDto) {
    return attemptRepository.create(values);
  }

  async submit(id: string) {
    const attempt = await this.getById(id);

    if (attempt.submitted_at) {
      throw new Error("Attempt already submitted");
    }

    return attemptRepository.submit(id);
  }

  async finish(id: string) {
    return attemptRepository.finish(id);
  }

  async updateScore(
    id: string,
    score: number
  ) {
    return attemptRepository.updateScore(
      id,
      score
    );
  }

  async updateDuration(
    id: string,
    duration: number
  ) {
    return attemptRepository.updateDuration(
      id,
      duration
    );
  }

  async delete(id: string) {
    return attemptRepository.delete(id);
  }
}

export const attemptService =
  new AttemptService();