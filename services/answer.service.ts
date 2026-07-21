import {
  answerRepository,
  CreateAnswerDto,
} from "@/repositories/answer.repository";

export class AnswerService {
  getByQuestion(questionId: string) {
    return answerRepository.getByQuestion(questionId);
  }

  getById(id: string) {
    return answerRepository.getById(id);
  }

  create(values: CreateAnswerDto) {
    if (!values.content.trim()) {
      throw new Error("Answer content is required");
    }

    return answerRepository.create(values);
  }

  update(
    id: string,
    values: Partial<CreateAnswerDto>
  ) {
    return answerRepository.update(id, values);
  }

  delete(id: string) {
    return answerRepository.delete(id);
  }

  restore(id: string) {
    return answerRepository.restore(id);
  }

  duplicate(id: string) {
    return answerRepository.duplicate(id);
  }

  reorder(
    id: string,
    answerNo: number
  ) {
    return answerRepository.reorder(
      id,
      answerNo
    );
  }

  setCorrect(id: string) {
    return answerRepository.setCorrect(id);
  }

  unsetCorrect(id: string) {
    return answerRepository.unsetCorrect(id);
  }
}

export const answerService =
  new AnswerService();