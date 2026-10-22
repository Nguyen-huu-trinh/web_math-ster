export const tutoringCache = {
  key: (userId: string, month: string) => ["tutoring-slots", userId, month] as const,
  staleTime: 2 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
};
