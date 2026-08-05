import { useQuery } from "@tanstack/react-query";
import { dashboardClientService } from "@/services/dashboard-client.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.leaderboard,
    queryFn: () =>
      dashboardClientService.getLeaderboard(),
    staleTime: 1000 * 30,
  });
}
