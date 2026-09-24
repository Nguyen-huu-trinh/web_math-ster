"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { NotificationFeed } from "@/types/notification";

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const client = useQueryClient();
  const key = ["notifications", userId] as const;
  const query = useQuery<NotificationFeed>({
    queryKey: key,
    enabled: Boolean(userId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await createClient().rpc("get_notification_feed");
      if (error) throw error;
      return data as NotificationFeed;
    },
  });
  const mutation = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!userId) throw new Error("Vui lòng đăng nhập lại.");
      if (!ids.length) return;
      const { error } = await createClient().from("notification_reads").upsert(
        [...new Set(ids)].map((id) => ({ user_id: userId, notification_id: id })),
        { onConflict: "user_id,notification_id", ignoreDuplicates: true },
      );
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      client.setQueryData<NotificationFeed>(key, (old) => {
        if (!old) return old;
        const changed = old.items.filter((item) => ids.includes(item.id) && !item.is_read).length;
        return { items: old.items.map((item) => ids.includes(item.id) ? { ...item, is_read: true } : item), unreadCount: Math.max(0, old.unreadCount - changed) };
      });
      void client.invalidateQueries({ queryKey: key, refetchType: "none" });
    },
  });
  return {
    ...query,
    notifications: query.data?.items ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isMarking: mutation.isPending,
    markAsRead: (id: string) => mutation.mutateAsync([id]),
    markAllAsRead: () => mutation.mutateAsync((query.data?.items ?? []).filter((item) => !item.is_read).map((item) => item.id)),
  };
}
