import Notification from "../models/notificationModel";

export const createNotification = async (
  receiverId: string,
  senderId: string,
  type: "LIKE" | "COMMENT" | "FOLLOW_ARC",
  entityId: string
) => {
  try {
    await Notification.create({
      receiverId,
      senderId,
      type,
      entityId,
      isRead: false,
      createdAt: new Date()
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return;
    }
    console.error("Error creating notification:", error);
  }
};