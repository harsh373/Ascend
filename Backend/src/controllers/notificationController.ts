import { Request, Response } from "express";
import Notification from "../models/notificationModel";
import { User } from "../models/userModel";
import Arc from "../models/arcModel";

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

    const arcIds = notifications
      .filter(n => n.type === "ARC_INVITE")
      .map(n => n.entityId);

    const arcs = arcIds.length > 0
      ? await Arc.find({ _id: { $in: arcIds } }).select("_id title").lean()
      : [];

    const arcMap = new Map(arcs.map(a => [a._id.toString(), a.title]));

    const notificationsWithSender = notifications.map(n => ({
      id: n._id,
      type: n.type,
      entity_id: n.entityId,
      is_read: n.isRead,
      created_at: n.createdAt,
      sender: senderMap.get(n.senderId) || { id: n.senderId, name: "Unknown", avatar_url: "" },
      arc_title: n.type === "ARC_INVITE" ? arcMap.get(n.entityId) || "" : undefined
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

export const respondToInvite = async (req: Request, res: Response) => {
  try {
    const { notificationId, userId, accept } = req.body;

    if (!notificationId || !userId || accept === undefined) {
      return res.status(400).json({ message: "notificationId, userId, and accept are required" });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.receiverId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    notification.isRead = true;
    await notification.save();

    if (accept) {
      const arc = await Arc.findById(notification.entityId);

      if (!arc) {
        return res.status(404).json({ message: "Arc not found" });
      }

      const alreadyFollowing = arc.followers.some((f: any) => f.userId === userId);

      if (!alreadyFollowing) {
        arc.followers.push({
          userId,
          status: "approved",
          createdAt: new Date()
        } as any);

        await arc.save();
      }

      return res.status(200).json({ message: "Invite accepted", arcId: arc._id });
    }

    res.status(200).json({ message: "Invite declined" });
  } catch (error) {
    console.error("Error responding to invite:", error);
    res.status(500).json({ message: "Server error" });
  }
};