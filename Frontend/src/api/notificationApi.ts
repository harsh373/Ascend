import api from "./axios";

export interface NotificationSender {
  id: string;
  name: string;
  avatar_url: string;
}

export interface Notification {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW_ARC" | "FOLLOW_REQUEST" | "FOLLOW_APPROVED";
  entity_id: string;
  is_read: boolean;
  created_at: string;
  sender: NotificationSender;
}

export const getNotifications = (userId: string) =>
  api.get<{ data: Notification[] }>(`/notifications/${userId}`);

export const markAllAsRead = (userId: string) =>
  api.post("/notifications/read", { userId });