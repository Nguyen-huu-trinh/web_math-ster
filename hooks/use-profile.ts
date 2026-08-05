import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/query-keys";
import { profileClientService } from "@/services/profile-client.service";
import type { Profile } from "@/types/profile";

export function useProfile(id?: string) {
  return useQuery<Profile>({
    queryKey: queryKeys.profile.detail(id ?? "anonymous"),
    queryFn: () => profileClientService.getById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateProfile(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Parameters<typeof profileClientService.update>[1]) =>
      profileClientService.update(id!, values),
    onSuccess: (profile) => {
      if (!id) return;
      queryClient.setQueryData(queryKeys.profile.detail(id), profile);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: {
      currentPassword: string;
      newPassword: string;
    }) => profileClientService.changePassword(currentPassword, newPassword),
  });
}
