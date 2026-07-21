import {
  documentRepository,
  CreateDocumentDto,
} from "@/repositories/document.repository";

export class DocumentService {
  getByLesson(lessonId: string) {
    return documentRepository.getByLesson(
      lessonId
    );
  }

  getById(id: string) {
    return documentRepository.getById(id);
  }

  create(values: CreateDocumentDto) {
    return documentRepository.create(values);
  }

  update(
    id: string,
    values: Partial<CreateDocumentDto>
  ) {
    return documentRepository.update(id, values);
  }

  delete(id: string) {
    return documentRepository.delete(id);
  }
}

export const documentService =
  new DocumentService();