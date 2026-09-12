"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  teacherScheduleService,
  type CreateTeacherScheduleInput,
  type UpdateTeacherScheduleInput,
} from "@/services/teacher-schedule.service";

export const teacherScheduleKeys = {
  all: ["teacher-schedule"] as const,

  range: (startDate: string, endDate: string) =>
    [...teacherScheduleKeys.all, "range", startDate, endDate] as const,
};

export function useTeacherSchedule(
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: teacherScheduleKeys.range(
      startDate,
      endDate
    ),

    queryFn: () =>
      teacherScheduleService.getByRange(
        startDate,
        endDate
      ),

    enabled:
      Boolean(startDate) &&
      Boolean(endDate),

    staleTime: 30 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });
}

export function useCreateTeacherSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateTeacherScheduleInput
    ) => teacherScheduleService.create(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teacherScheduleKeys.all,
      });
    },
  });
}

export function useUpdateTeacherSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTeacherScheduleInput;
    }) =>
      teacherScheduleService.update(
        id,
        input
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teacherScheduleKeys.all,
      });
    },
  });
}

export function useDeleteTeacherSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      teacherScheduleService.remove(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teacherScheduleKeys.all,
      });
    },
  });
}