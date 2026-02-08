import { Response } from "express";
import { User } from "../models/userModel";
import { Habit } from "../models/habitModel";
import Challenge from "../models/challenge";
import Task from "../models/taskModel";

// Extend Express Request 
interface AuthenticatedRequest extends Express.Request {
  query: any;
  params: { userId: any; };
  auth: () => Promise<{ userId?: string } | null>;
}


export const getPublicProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const auth = await req.auth(); 
    const viewerId = auth?.userId; 

    

    

  
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    const isFriend = user.friends.includes(viewerId || "");
    const isOwnProfile = userId === viewerId;
    
    
    const hasSentRequest = viewerId 
      ? user.friendRequests.includes(viewerId)
      : false;


    
    const canViewPrivateData = user.isPublic || isFriend || isOwnProfile;

    
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
      hasSentRequest, 
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
    const auth = await req.auth(); 
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
    const auth = await req.auth(); 
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


export const getUserChallenges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const auth = await req.auth(); 
    const viewerId = auth?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter = req.query.filter as string || "all";
    const skip = (page - 1) * limit;

    
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

    
    let query: any = { opponentId: userId };

    if (filter === "won") {
      query.status = "approved";
    } else if (filter === "lost") {
      query.status = "failed";
    } else {
    
      query.status = { $in: ["approved", "failed"] };
    }

  
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