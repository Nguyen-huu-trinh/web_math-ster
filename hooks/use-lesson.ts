import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonClientService } from "@/services/lesson-client.service";
import { lessonContentService } from "@/services/lesson-content.service";
import { learningProgressService } from "@/services/learning-progress.service";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { CreateLessonContentDto, UpdateLessonContentDto } from "@/repositories/lesson-content.repository";
import type { UpdateLearningProgressDto } from "@/repositories/learning-progress.repository";

export function useLesson(lessonId: string) {
  const query = useQuery({
    queryKey: queryKeys.lesson.detail(lessonId),
    queryFn: () => lessonClientService.getById(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  return { 
    ...query, 
    lesson: query.data ?? null, 
    loading: query.isLoading 
  };
}

function useLessonMutation<TVariables>(
  courseId: string,
  lessonId?: string,
  mutationFn?: (variables: TVariables) => Promise<unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutationFn!,
    onSuccess: () => {
      // 1. Invalidate bài học cụ thể (nếu có lessonId)
      if (lessonId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.lesson.detail(lessonId),
        });
      }

      // 2. Invalidate tiến độ khóa học
      if (courseId) {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key.includes("course") && key.includes(courseId);
          },
        });
      }
    },
  });
}

// Đặt lessonId là optional (?): Nếu truyền vào thì invalidate cả bài học, không truyền vẫn chạy bình thường
export function useCreateLessonContent(courseId: string, lessonId?: string) {
  return useLessonMutation<CreateLessonContentDto>(
    courseId,
    lessonId,
    (values) => lessonContentService.create(values)
  );
}

export function useUpdateLessonContent(courseId: string, lessonId?: string) {
  return useLessonMutation<{ id: string; values: UpdateLessonContentDto }>(
    courseId,
    lessonId,
    ({ id, values }) => lessonContentService.update(id, values)
  );
}

export function useDeleteLessonContent(courseId: string, lessonId?: string) {
  return useLessonMutation<string>(
    courseId,
    lessonId,
    (id) => lessonContentService.delete(id)
  );
}

export function useSaveLearningProgress(courseId: string, lessonId?: string) {
  return useLessonMutation<UpdateLearningProgressDto>(
    courseId,
    lessonId,
    (values) => learningProgressService.save(values)
  );
}