import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { examClientService } from "@/services/exam-client.service";

import {
  AnswerKey,
  CreateExamDto,
  UpdateExamDto,
} from "@/types/exam";

import { queryKeys } from "@/lib/react-query/query-keys";

// =========================
// Queries
// =========================

export function useExams() {
  return useQuery({
    queryKey: queryKeys.exam.all,
    queryFn: () => examClientService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useExam(id: string) {
  return useQuery({
    enabled: !!id,
    queryKey: queryKeys.exam.detail(id),
    queryFn: () => examClientService.getById(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAnswerKey(id: string) {
  return useQuery({
    enabled: !!id,
    queryKey: queryKeys.exam.answerKey(id),
    queryFn: () => examClientService.getAnswerKey(id),
    staleTime: 1000 * 60 * 5,
  });
}

// =========================
// Mutations
// =========================

export function useCreateExam() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: (values: CreateExamDto) =>
      examClientService.create(values),

    onSuccess() {

      qc.invalidateQueries({
        queryKey: queryKeys.exam.all,
      });

    },

  });

}

export function useUpdateExam() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: UpdateExamDto;
    }) =>
      examClientService.update(
        id,
        values
      ),

    onSuccess(_, variables) {

      qc.invalidateQueries({
        queryKey: queryKeys.exam.all,
      });

      qc.invalidateQueries({
        queryKey: queryKeys.exam.detail(
          variables.id
        ),
      });

    },

  });

}

export function useUpdateAnswerKey() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: ({
      id,
      answerKey,
    }: {
      id: string;
      answerKey: AnswerKey;
    }) =>
      examClientService.updateAnswerKey(
        id,
        answerKey
      ),

    onSuccess(_, variables) {

      qc.invalidateQueries({
        queryKey:
          queryKeys.exam.answerKey(
            variables.id
          ),
      });

      qc.invalidateQueries({
        queryKey: queryKeys.exam.detail(variables.id),
      });

    },

  });

}

export function usePublishExam() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: (id: string) =>
      examClientService.publish(id),

    onSuccess(_, id) {

      qc.invalidateQueries({
        queryKey: queryKeys.exam.all,
      });

      qc.invalidateQueries({
        queryKey: queryKeys.exam.detail(id),
      });

    },

  });

}

export function useCloseExam() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: (id: string) =>
      examClientService.close(id),

    onSuccess(_, id) {

      qc.invalidateQueries({
        queryKey: queryKeys.exam.all,
      });

      qc.invalidateQueries({
        queryKey: queryKeys.exam.detail(id),
      });

    },

  });

}

export function useDuplicateExam() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: (id: string) =>
      examClientService.duplicate(id),

    onSuccess(_, id) {

      qc.invalidateQueries({
        queryKey: queryKeys.exam.all,
      });

      qc.invalidateQueries({
        queryKey: queryKeys.exam.detail(id),
      });

    },

  });

}

export function useDeleteExam() {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: (id: string) =>
      examClientService.delete(id),

    onSuccess(_, id) {

      qc.invalidateQueries({
        queryKey: queryKeys.exam.all,
      });

      qc.removeQueries({
        queryKey: queryKeys.exam.detail(id),
      });

      qc.removeQueries({
        queryKey: queryKeys.exam.answerKey(id),
      });

    },

  });

}

export function useUploadExamFile() {
  return useMutation({
    mutationFn: (file: File) => examClientService.upload(file),
  });
}
