import { Request, Response } from "express";
import { User } from "../models/userModel";

// SEARCH USERS
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Search query required" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: `^${query}`, $options: "i" } },
        { fullName: { $regex: `^${query}`, $options: "i" } }
      ]
    }).select("username clerkUserId fullName profileImage level xp");

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// SEND FRIEND REQUEST
export const sendRequest = async (req: Request, res: Response) => {
  try {
    const { fromId, toId } = req.body;

    if (!fromId || !toId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    if (fromId === toId) {
      return res.status(400).json({ message: "You can't add yourself" });
    }

    const toUser = await User.findOne({ clerkUserId: toId });
    const fromUser = await User.findOne({ clerkUserId: fromId });

    if (!toUser || !fromUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends or request exists
    if (
      toUser.friendRequests.includes(fromId) ||
      toUser.friends.includes(fromId) ||
      fromUser.sentRequests.includes(toId)
    ) {
      return res.status(400).json({ message: "Request already exists" });
    }

    // Update BOTH users 
    await User.updateOne(
      { clerkUserId: toId },
      { $addToSet: { friendRequests: fromId } }
    );

    // Add to sender's outgoing requests
    await User.updateOne(
      { clerkUserId: fromId },
      { $addToSet: { sentRequests: toId } }
    );

    res.json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Send request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ACCEPT FRIEND REQUEST
export const acceptRequest = async (req: Request, res: Response) => {
  try {
    const { userId, fromId } = req.body;

    if (!userId || !fromId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const user = await User.findOne({ clerkUserId: userId });
    const fromUser = await User.findOne({ clerkUserId: fromId });

    if (!user || !fromUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friendRequests.includes(fromId)) {
      return res.status(400).json({ message: "No request to accept" });
    }

    // Atomic updates - clean up request tracking on BOTH sides
    await User.updateOne(
      { clerkUserId: userId },
      {
        $pull: { friendRequests: fromId },
        $addToSet: { friends: fromId }
      }
    );

    await User.updateOne(
      { clerkUserId: fromId },
      {
        $pull: { sentRequests: userId },
        $addToSet: { friends: userId }
      }
    );

    res.json({ message: "Friend added successfully" });
  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET FRIENDS LIST
export const getFriends = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = await User.find({
      clerkUserId: { $in: user.friends },
    }).select("username clerkUserId fullName profileImage xp level");

    res.json(friends);
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SENT REQUESTS 
export const getSentRequests = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return just the array of IDs
    res.json(user.sentRequests);
  } catch (error) {
    console.error("Get sent requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};