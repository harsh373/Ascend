import api from "./axios";

export interface NotificationSender {
  id: string;
  name: string;
  avatar_url: string;
}

export interface Notification {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW_ARC" | "FOLLOW_REQUEST" | "FOLLOW_APPROVED" | "ARC_INVITE";
  entity_id: string;
  is_read: boolean;
  created_at: string;
  sender: NotificationSender;
  arc_title?: string;
}

export const getNotifications = (userId: string) =>
  api.get<{ data: Notification[] }>(`/notifications/${userId}`);

export const markAllAsRead = (userId: string) =>
  api.post("/notifications/read", { userId });

export const respondToInvite = (notificationId: string, userId: string, accept: boolean) =>
  api.post("/notifications/invite-respond", { notificationId, userId, accept });