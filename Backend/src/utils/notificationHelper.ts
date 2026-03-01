import Notification from "../models/notificationModel";

export const createNotification = async (
  receiverId: string,
  senderId: string,
  type: "LIKE" | "COMMENT" | "FOLLOW_ARC" | "FOLLOW_REQUEST" | "FOLLOW_APPROVED",
  entityId: string
) => {
  try {
    console.log("Creating notification:", { receiverId, senderId, type, entityId });
    
    const notification = await Notification.create({
      receiverId,
      senderId,
      type,
      entityId,
      isRead: false,
      createdAt: new Date()
    });
    
    console.log("Notification created successfully:", notification._id);
  } catch (error: any) {
    if (error.code === 11000) {
      console.log("Duplicate notification prevented");
      return;
    }
    console.error("Error creating notification:", error);
    throw error;
  }
};