import {
  CreateQuestionDto,
  questionRepository,
} from "@/repositories/question.repository";

export class QuestionService {
  getByExam(examId: string) {
    return questionRepository.getByExam(examId);
  }

  getById(id: string) {
    return questionRepository.getById(id);
  }

  create(values: CreateQuestionDto) {
    if (!values.content.trim()) {
      throw new Error("Question content is required");
    }

    if (values.score <= 0) {
      throw new Error("Invalid score");
    }

    return questionRepository.create(values);
  }

  update(
    id: string,
    values: Partial<CreateQuestionDto>
  ) {
    return questionRepository.update(id, values);
  }

  delete(id: string) {
    return questionRepository.delete(id);
  }

  restore(id: string) {
    return questionRepository.restore(id);
  }

  duplicate(id: string) {
    return questionRepository.duplicate(id);
  }

  reorder(
    id: string,
    questionNo: number
  ) {
    return questionRepository.reorder(
      id,
      questionNo
    );
  }
}

export const questionService =
  new QuestionService();