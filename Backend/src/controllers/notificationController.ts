import { Request, Response } from "express";
import Notification from "../models/notificationModel";
import { User } from "../models/userModel";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .lean();

    const senderIds = [...new Set(notifications.map(n => n.senderId))];
    
    const senders = await User.find({ clerkUserId: { $in: senderIds } })
      .select("clerkUserId username profileImage")
      .lean();

    const senderMap = new Map(
      senders.map(s => [s.clerkUserId, { id: s.clerkUserId, name: s.username, avatar_url: s.profileImage }])
    );

    const notificationsWithSender = notifications.map(n => ({
      id: n._id,
      type: n.type,
      entity_id: n.entityId,
      is_read: n.isRead,
      created_at: n.createdAt,
      sender: senderMap.get(n.senderId) || { id: n.senderId, name: "Unknown", avatar_url: "" }
    }));

    res.status(200).json({ data: notificationsWithSender });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    await Notification.updateMany(
      { receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};