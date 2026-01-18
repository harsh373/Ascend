import { Request, Response } from "express";
import { User } from "../models/userModel";

// GLOBAL LEADERBOARD
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .select("username fullName profileImage xp level clerkUserId")
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error("Global leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// FRIENDS LEADERBOARD
export const getFriendsLeaderboard = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = await User.find({
      clerkUserId: { $in: user.friends },
    })
      .sort({ xp: -1 })
      .select("username fullName profileImage xp level clerkUserId");

    res.json(friends);
  } catch (error) {
    console.error("Friends leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
