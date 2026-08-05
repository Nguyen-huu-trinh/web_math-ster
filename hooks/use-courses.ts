import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCourseDto } from "@/repositories/course.repository";
import { courseClientService } from "@/services/course-client.service";
import { Course } from "@/types/course";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useCourses() {
  const query = useQuery<Course[]>({
    queryKey: queryKeys.course.all,
    queryFn: () => courseClientService.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    courses: query.data ?? [],
    loading: query.isLoading,
  };
}

function useCourseMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.course.all,
      }),
  });
}

export function useCreateCourse() {
  return useCourseMutation<CreateCourseDto>((values) =>
    courseClientService.create(values)
  );
}

export function useUpdateCourse() {
  return useCourseMutation<{
    id: string;
    values: Partial<CreateCourseDto>;
  }>(({ id, values }) => courseClientService.update(id, values));
}

export function useDeleteCourse() {
  return useCourseMutation<string>((id) =>
    courseClientService.delete(id)
  );
}

export function useRestoreCourse() {
  return useCourseMutation<string>((id) =>
    courseClientService.restore(id)
  );
}
