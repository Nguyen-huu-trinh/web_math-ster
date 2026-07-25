import {
  fileLinkRepository,
  CreateFileLinkDto,
} from "@/repositories/file-link.repository";

class FileLinkService {
  create(values: CreateFileLinkDto) {
    return fileLinkRepository.create(values);
  }

  update(
    id: string,
    values: Partial<CreateFileLinkDto>
  ) {
    return fileLinkRepository.update(id, values);
  }

  delete(id: string) {
    return fileLinkRepository.delete(id);
  }
}

export const fileLinkService =
  new FileLinkService();