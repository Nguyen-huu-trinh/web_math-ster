import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chapterService } from "@/services/chapter.service";
import { courseDetailService } from "@/services/course-detail.service";
import { lessonService } from "@/services/lesson.service";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { CreateChapterDto } from "@/repositories/chapter.repository";
import type { CreateLessonDto, UpdateLessonDto } from "@/repositories/lesson.repository";

export function useCourseDetail(
  courseId: string,
  studentId?: string
) {
  const query = useQuery({
    queryKey: queryKeys.course.detail(courseId, studentId),
    queryFn: () => courseDetailService.getCourseDetail(courseId, studentId),
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 10,
  });

  return { ...query, course: query.data ?? null, loading: query.isLoading };
}

function useCourseDetailMutation<TVariables>(
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

export function useCreateChapter(courseId: string) {
  return useCourseDetailMutation<CreateChapterDto>(courseId, (values) =>
    chapterService.create(values)
  );
}

export function useUpdateChapter(courseId: string) {
  return useCourseDetailMutation<{ id: string; values: Partial<CreateChapterDto> }>(
    courseId,
    ({ id, values }) => chapterService.update(id, values)
  );
}

export function useDeleteChapter(courseId: string) {
  return useCourseDetailMutation<string>(courseId, (id) =>
    chapterService.delete(id)
  );
}

export function useCreateLesson(courseId: string) {
  return useCourseDetailMutation<CreateLessonDto>(courseId, (values) =>
    lessonService.create(values)
  );
}

export function useUpdateLesson(courseId: string) {
  return useCourseDetailMutation<{ id: string; values: UpdateLessonDto }>(
    courseId,
    ({ id, values }) => lessonService.update(id, values)
  );
}

export function useDeleteLesson(courseId: string) {
  return useCourseDetailMutation<string>(courseId, (id) =>
    lessonService.delete(id)
  );
}
