import { useMutation } from "@tanstack/react-query";
import {
  accountClientService,
  type CreateStudentPayload,
} from "@/services/account-client.service";

export function useCreateStudent() {
  return useMutation({
    mutationFn: (payload: CreateStudentPayload) =>
      accountClientService.createStudent(payload),
  });
}

export function useImportStudents() {
  return useMutation({
    mutationFn: ({ file, courseIds }: { file: File; courseIds: string[] }) =>
      accountClientService.importStudents(file, courseIds),
  });
}
