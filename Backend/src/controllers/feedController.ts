import { Request, Response } from "express";
import Arc from "../models/arcModel";
import { User } from "../models/userModel";

export const getFeed = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const allArcs = await Arc.find().sort({ lastUpdatedAt: -1 });

    let allUpdates: any[] = [];

    allArcs.forEach(arc => {
      const isOwner = arc.userId === userId;
      const isPublic = !arc.isPrivate;
      const isApprovedFollower = arc.followers.some(
        (f: any) => f.userId === userId && f.status === "approved"
      );

      const canView = isOwner || isPublic || isApprovedFollower;

      if (canView) {
        arc.updates.forEach((update: any) => {
          allUpdates.push({
            updateId: update._id,
            updateType: update.type,
            updateText: update.text,
            updateImages: update.images,
            updateLikes: update.likes || [],
            updateComments: update.comments || [],
            updateCreatedAt: update.createdAt,
            arcId: arc._id,
            arcTitle: arc.title,
            arcTheme: arc.theme,
            arcCoverPhoto: arc.coverPhoto,
            arcUserId: arc.userId
          });
        });
      }
    });

    allUpdates.sort((a, b) => 
      new Date(b.updateCreatedAt).getTime() - new Date(a.updateCreatedAt).getTime()
    );

    const uniqueUserIds = [...new Set(allUpdates.map(u => u.arcUserId))];
    const users = await User.find({
      clerkUserId: { $in: uniqueUserIds }
    });

    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.clerkUserId, {
        username: user.username,
        profileImage: user.profileImage
      });
    });

    const feedItems = allUpdates.map(update => ({
      ...update,
      username: userMap.get(update.arcUserId)?.username || "Unknown",
      profileImage: userMap.get(update.arcUserId)?.profileImage || ""
    }));

    res.status(200).json({ data: feedItems });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Server error" });
  }
};