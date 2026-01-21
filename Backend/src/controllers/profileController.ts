import { Response } from "express";
import { User } from "../models/userModel";
import { Habit } from "../models/habitModel";
import Challenge from "../models/challenge";
import Task from "../models/taskModel";

// Extend Express Request to include Clerk auth (as function)
interface AuthenticatedRequest extends Express.Request {
  query: any;
  params: { userId: any; };
  auth: () => Promise<{ userId?: string } | null>;
}

// Get public profile (with privacy check)
export const getPublicProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const auth = await req.auth(); // ✅ FIXED: Call as function
    const viewerId = auth?.userId; // Current logged-in user (from Clerk middleware)

    // 🔍 DEBUG LOGGING
    console.log("🔍 Profile Request Debug:");
    console.log("  - userId (from URL):", userId);
    console.log("  - viewerId (from Clerk):", viewerId);
    console.log("  - Are they equal?:", userId === viewerId);

    // Find target user
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if viewer is friends with this user
    const isFriend = user.friends.includes(viewerId || "");
    const isOwnProfile = userId === viewerId;

    console.log("  - isFriend:", isFriend);
    console.log("  - isOwnProfile:", isOwnProfile);
    console.log("  - user.friends array:", user.friends);

    // Determine what data to show based on privacy
    const canViewPrivateData = user.isPublic || isFriend || isOwnProfile;

    // Basic data (always visible)
    const basicData = {
      clerkUserId: user.clerkUserId,
      username: user.username,
      fullName: user.fullName,
      profileImage: user.profileImage,
      level: user.level,
      xp: user.xp,
      isPublic: user.isPublic,
      isOwnProfile,
      isFriend,
    };

    // If can't view private data, return basic info only
    if (!canViewPrivateData) {
      return res.json({
        ...basicData,
        message: "This profile is private",
        canViewDetails: false,
      });
    }

    // Calculate challenge stats
    const wonChallenges = await Challenge.countDocuments({
      opponentId: userId,
      status: "approved",
    });

    const lostChallenges = await Challenge.countDocuments({
      opponentId: userId,
      status: "failed",
    });

    const totalChallenges = wonChallenges + lostChallenges;
    const winRate = totalChallenges > 0 
      ? Math.round((wonChallenges / totalChallenges) * 100) 
      : 0;

    // Count completed tasks
    const completedTasks = await Task.countDocuments({
      userId,
      status: "approved",
    });

    // Fetch habits
    const habits = await Habit.find({ userId }).sort({ streak: -1 });

    // Full profile data
    return res.json({
      ...basicData,
      currentStreak: user.streak,
      longestStreak: user.longestStreak,
      friendsCount: user.friends.length,
      stats: {
        totalXp: user.xp,
        wonChallenges,
        lostChallenges,
        winRate,
        completedTasks,
      },
      habits: habits.map(h => ({
        title: h.title,
        streak: h.streak,
      })),
      canViewDetails: true,
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Toggle privacy setting
export const togglePrivacy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const auth = await req.auth(); // ✅ FIXED: Call as function
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Toggle privacy
    user.isPublic = !user.isPublic;
    await user.save();

    return res.json({
      message: `Profile is now ${user.isPublic ? "public" : "private"}`,
      isPublic: user.isPublic,
    });

  } catch (error) {
    console.error("Error toggling privacy:", error);
    return res.status(500).json({ error: "Failed to toggle privacy" });
  }
};

// Get user's completed tasks (with privacy check)
export const getUserTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const auth = await req.auth(); // ✅ FIXED: Call as function
    const viewerId = auth?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Find user and check privacy
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFriend = user.friends.includes(viewerId || "");
    const isOwnProfile = userId === viewerId;
    const canView = user.isPublic || isFriend || isOwnProfile;

    if (!canView) {
      return res.status(403).json({ 
        error: "This profile is private",
        tasks: [],
        total: 0,
      });
    }

    // Fetch tasks
    const tasks = await Task.find({ 
      userId, 
      status: "approved" 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments({ 
      userId, 
      status: "approved" 
    });

    return res.json({
      tasks,
      total,
      page,
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Get user's challenges (with privacy check)
export const getUserChallenges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const auth = await req.auth(); // ✅ FIXED: Call as function
    const viewerId = auth?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter = req.query.filter as string || "all";
    const skip = (page - 1) * limit;

    // Find user and check privacy
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFriend = user.friends.includes(viewerId || "");
    const isOwnProfile = userId === viewerId;
    const canView = user.isPublic || isFriend || isOwnProfile;

    if (!canView) {
      return res.status(403).json({ 
        error: "This profile is private",
        challenges: [],
        total: 0,
      });
    }

    // Build query based on filter
    let query: any = { opponentId: userId };

    if (filter === "won") {
      query.status = "approved";
    } else if (filter === "lost") {
      query.status = "failed";
    } else {
      // "all" - show both won and lost
      query.status = { $in: ["approved", "failed"] };
    }

    // Fetch challenges
    const challenges = await Challenge.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Challenge.countDocuments(query);

    return res.json({
      challenges,
      total,
      page,
      pages: Math.ceil(total / limit),
      filter,
    });

  } catch (error) {
    console.error("Error fetching challenges:", error);
    return res.status(500).json({ error: "Failed to fetch challenges" });
  }
};