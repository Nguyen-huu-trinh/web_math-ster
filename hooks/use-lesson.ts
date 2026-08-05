import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonClientService } from "@/services/lesson-client.service";
import { lessonContentService } from "@/services/lesson-content.service";
import { learningProgressService } from "@/services/learning-progress.service";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { CreateLessonContentDto, UpdateLessonContentDto } from "@/repositories/lesson-content.repository";
import type { UpdateLearningProgressDto } from "@/repositories/learning-progress.repository";

export function useLesson(
  lessonId: string
) {
  const query = useQuery({
    queryKey: queryKeys.lesson.detail(lessonId),
    queryFn: () => lessonClientService.getById(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 1000 * 60 * 10,
  });

  return { ...query, lesson: query.data ?? null, loading: query.isLoading };
}

function useLessonMutation<TVariables>(
  courseId: string,
  mutationFn: (variables: TVariables) => Promise<unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["course", courseId],
      }),
  });
}

export function useCreateLessonContent(courseId: string) {
  return useLessonMutation<CreateLessonContentDto>(courseId, (values) =>
    lessonContentService.create(values)
  );
}

export function useUpdateLessonContent(courseId: string) {
  return useLessonMutation<{ id: string; values: UpdateLessonContentDto }>(
    courseId,
    ({ id, values }) => lessonContentService.update(id, values)
  );
}

export function useDeleteLessonContent(courseId: string) {
  return useLessonMutation<string>(courseId, (id) =>
    lessonContentService.delete(id)
  );
}

export function useSaveLearningProgress(courseId: string) {
  return useLessonMutation<UpdateLearningProgressDto>(courseId, (values) =>
    learningProgressService.save(values)
  );
}
