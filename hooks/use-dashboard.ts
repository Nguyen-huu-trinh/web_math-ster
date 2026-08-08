import { useQuery } from "@tanstack/react-query";

import { dashboardClientService } from "@/services/dashboard-client.service";
import type {
    StudentDashboard,
    TeacherDashboard,
} from "@/services/dashboard-client.service";

import { queryKeys } from "@/lib/react-query/query-keys";

// import type {
//   StudentDashboard,
//   TeacherDashboard,
// } from "@/types/dashboard";


export function useActiveStudentCount() {
    return useQuery({
        queryKey: ["active-student-count"],
        queryFn: () =>
            dashboardClientService
                .getActiveStudentCount(),
        refetchInterval: 60 * 1000,
    });
}


export function useStudentDashboard() {
  return useQuery<StudentDashboard>({
    queryKey: queryKeys.dashboard.student,
    queryFn: () =>
      dashboardClientService.getStudentDashboard(),
    staleTime: 1000 * 30,
  });
}

export function useTeacherDashboard() {
  return useQuery<TeacherDashboard>({
    queryKey: queryKeys.dashboard.teacher,
    queryFn: () =>
      dashboardClientService.getTeacherDashboard(),
    staleTime: 1000 * 30,
  });
}
