export type NotificationType = "EXAM" | "LESSON_MATERIAL" | "GENERAL" | "ANNOUNCEMENT";
export interface BroadcastNotification {
  id: string;
  title: string;
  content: string | null;
  type: NotificationType;
  subtype?: string | null;
  link: string;
  created_at: string;
  is_read: boolean;
}
export interface NotificationFeed {
  items: BroadcastNotification[];
  unreadCount: number;
}
