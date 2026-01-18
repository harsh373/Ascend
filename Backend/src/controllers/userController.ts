import { Request, Response } from "express";
import { User } from "../models/userModel";
import Task from "../models/taskModel";
import { getRank } from "../utils/getRank";

export const createUser = async (req: Request, res: Response) => {
  console.log("createUser controller called");

  try {
    const { clerkUserId, username, fullName, profileImage } = req.body;

    console.log("Request body:", req.body);

    if (!clerkUserId || !username || !fullName) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findOne({ clerkUserId });

    if (existingUser) {
      console.log("User already exists:", existingUser._id);
      return res.json(existingUser);
    }

    console.log("Creating new user...");

    const user = await User.create({
      clerkUserId,
      username,
      fullName,
      profileImage: profileImage || "",  
      xp: 0,
      level: 1,
      streak: 0,
      friends: [],
      friendRequests: []
    });

    console.log("User created successfully:", user._id);

    res.json(user);

  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requests = await User.find({
      clerkUserId: { $in: user.friendRequests },
    }).select("username fullName profileImage clerkUserId");

    res.json(requests);
  } catch (error) {
    console.error("Get friend requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalTasks = await Task.countDocuments({ userId });
    const heavyApproved = await Task.countDocuments({ userId, status: "approved" });
    const heavyRejected = await Task.countDocuments({ userId, status: "rejected" });

    const recentTasks = await Task.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status xp");

    res.json({
      username: user.username,
      fullName: user.fullName,
      profileImage: user.profileImage,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      joinDate: user.createdAt,
      friendsCount: user.friends?.length || 0,
      stats: {
        totalTasks,
        heavyApproved,
        heavyRejected
      },
      recentTasks
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user friends
export const getUserFriends = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = await User.find({
      clerkUserId: { $in: user.friends }
    }).select("clerkUserId username fullName profileImage level xp");

    const formattedFriends = friends.map(friend => ({
      userId: friend.clerkUserId,
      username: friend.username,
      fullName: friend.fullName,
      profileImage: friend.profileImage,
      level: friend.level,
      rank: getRank(friend.level)
    }));

    res.json(formattedFriends);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//for uploading of images

export const uploadAvatar = async (req: any, res: Response) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = req.file.path;

    await User.findOneAndUpdate(
      { clerkUserId: userId },
      { profileImage: imageUrl }
    );

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

