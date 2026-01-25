import { Request, Response } from "express";
import { User } from "../models/userModel";
import { Habit } from "../models/habitModel";
import Challenge from "../models/challenge";
import Task from "../models/taskModel";

interface Activity {
  friendId: string;
  friendName: string;
  friendPhoto: string;
  activityType: 'habit' | 'streak_milestone' | 'challenge' | 'task' | 'level_up';
  activityText: string;
  metadata: {
    habitName?: string;
    streakCount?: number;
    xpGained?: number;
    challengeTitle?: string;
    level?: number;
    taskTitle?: string;
    opponentId?: string;
    opponentName?: string;
  };
  timestamp: Date;
}

// Helper: Calculate "X minutes ago"
const getTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return new Date(timestamp).toLocaleDateString();
};

// Helper: Check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// Helper: Check if streak is a milestone
const checkStreakMilestone = (streakCount: number): boolean => {
  const milestones = [5, 10, 15, 20, 25, 30, 50, 75, 100];
  return milestones.includes(streakCount);
};

// Main Feed Controller
export const getFeed = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const activities: Activity[] = [];

    // Get user and their friends
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendIds = user.friends || [];

    if (friendIds.length === 0) {
      return res.json({ activities: [] });
    }

    // Get friends data for metadata
    const friends = await User.find({ clerkUserId: { $in: friendIds } });
    const friendMap = new Map(friends.map(f => [f.clerkUserId, f]));

    // Calculate date range (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. HABIT COMPLETIONS (TODAY ONLY)
    const habits = await Habit.find({
      userId: { $in: friendIds },
      lastCompleted: { $exists: true }
    });

    habits.forEach(habit => {
      if (habit.lastCompleted && isToday(habit.lastCompleted)) {
        const friend = friendMap.get(habit.userId);
        if (friend) {
          // Regular habit completion
          activities.push({
            friendId: friend.clerkUserId,
            friendName: friend.fullName || friend.username,
            friendPhoto: friend.profileImage || "",
            activityType: 'habit',
            activityText: `completed "${habit.title}"`,
            metadata: {
              habitName: habit.title,
              streakCount: habit.streak || 0
            },
            timestamp: habit.lastCompleted
          });

          // Check if this completion hit a streak milestone
          if (habit.streak && checkStreakMilestone(habit.streak)) {
            activities.push({
              friendId: friend.clerkUserId,
              friendName: friend.fullName || friend.username,
              friendPhoto: friend.profileImage || "",
              activityType: 'streak_milestone',
              activityText: `hit ${habit.streak}-day streak on "${habit.title}"!`,
              metadata: {
                habitName: habit.title,
                streakCount: habit.streak
              },
              timestamp: habit.lastCompleted
            });
          }
        }
      }
    });

    // 2. CHALLENGE ACTIVITY (last 7 days, accepted/approved/failed only)
    const challenges = await Challenge.find({
      $or: [
        { challengerId: { $in: friendIds } },
        { opponentId: { $in: friendIds } }
      ],
      createdAt: { $gte: sevenDaysAgo },
      status: { $in: ['accepted', 'approved', 'failed'] }
    });

    challenges.forEach(challenge => {
      // Skip if IDs are missing
      if (!challenge.challengerId || !challenge.opponentId) return;

      const challengerFriend = friendMap.get(challenge.challengerId);
      const opponentFriend = friendMap.get(challenge.opponentId);

      // Get names for display
      const challengerName = challengerFriend ? (challengerFriend.fullName || challengerFriend.username) : challenge.challengerName || 'Someone';
      const opponentName = opponentFriend ? (opponentFriend.fullName || opponentFriend.username) : challenge.opponentName || 'Someone';

      // Challenge accepted - show who accepted
      if (challenge.status === 'accepted' && opponentFriend) {
        const challengeTitle = challenge.title ? ` "${challenge.title}"` : '';
        activities.push({
          friendId: opponentFriend.clerkUserId,
          friendName: opponentFriend.fullName || opponentFriend.username,
          friendPhoto: opponentFriend.profileImage || "",
          activityType: 'challenge',
          activityText: `accepted${challengeTitle} challenge from ${challengerName}`,
          metadata: {
            challengeTitle: challenge.title || undefined,
            opponentId: challenge.challengerId,
            opponentName: challengerName
          },
          timestamp: challenge.createdAt
        });
      }

      // Challenge approved (won) - show winner vs loser
      if (challenge.status === 'approved' && opponentFriend) {
        const challengeTitle = challenge.title ? ` "${challenge.title}"` : '';
        activities.push({
          friendId: opponentFriend.clerkUserId,
          friendName: opponentFriend.fullName || opponentFriend.username,
          friendPhoto: opponentFriend.profileImage || "",
          activityType: 'challenge',
          activityText: `won${challengeTitle} challenge vs ${challengerName}`,
          metadata: {
            challengeTitle: challenge.title || undefined,
            xpGained: challenge.xpReward || 50,
            opponentId: challenge.challengerId,
            opponentName: challengerName
          },
          timestamp: challenge.createdAt
        });
      }

      // Challenge failed - show who failed
      if (challenge.status === 'failed') {
        // Determine who failed (could be either)
        const failedFriend = opponentFriend || challengerFriend;
        const otherPerson = failedFriend === opponentFriend ? challengerName : opponentName;
        const otherPersonId = failedFriend === opponentFriend ? challenge.challengerId : challenge.opponentId;
        
        if (failedFriend) {
          const challengeTitle = challenge.title ? ` "${challenge.title}"` : '';
          activities.push({
            friendId: failedFriend.clerkUserId,
            friendName: failedFriend.fullName || failedFriend.username,
            friendPhoto: failedFriend.profileImage || "",
            activityType: 'challenge',
            activityText: `failed${challengeTitle} challenge vs ${otherPerson}`,
            metadata: {
              challengeTitle: challenge.title || undefined,
              opponentId: otherPersonId,
              opponentName: otherPerson
            },
            timestamp: challenge.createdAt
          });
        }
      }
    });

    // 3. TASK COMPLETIONS (last 7 days, approved only)
    const tasks = await Task.find({
      userId: { $in: friendIds },
      status: 'approved',
      updatedAt: { $gte: sevenDaysAgo }
    });

    tasks.forEach(task => {
      const friend = friendMap.get(task.userId);
      if (friend) {
        activities.push({
          friendId: friend.clerkUserId,
          friendName: friend.fullName || friend.username,
          friendPhoto: friend.profileImage || "",
          activityType: 'task',
          activityText: `completed task "${task.title}"`,
          metadata: {
            taskTitle: task.title,
            xpGained: task.xp || 10
          },
          timestamp: task.updatedAt || task.createdAt
        });
      }
    });

    // 4. LEVEL UPS (last 7 days, calculate based on recent XP)
    friends.forEach(friend => {
      if (friend.updatedAt && friend.updatedAt >= sevenDaysAgo) {
        const currentLevel = friend.level;
        
        // Check if they recently leveled up (XP close to level threshold)
        const levelThreshold = Math.pow(currentLevel - 1, 2) * 100;
        const nextLevelThreshold = Math.pow(currentLevel, 2) * 100;
        
        // If XP is within 100 of current level threshold, they just leveled up
        if (friend.xp >= levelThreshold && friend.xp < levelThreshold + 100 && currentLevel > 1) {
          activities.push({
            friendId: friend.clerkUserId,
            friendName: friend.fullName || friend.username,
            friendPhoto: friend.profileImage || "",
            activityType: 'level_up',
            activityText: `reached Level ${currentLevel}!`,
            metadata: {
              level: currentLevel
            },
            timestamp: friend.updatedAt
          });
        }
      }
    });

    // Sort by timestamp (newest first) and limit to 20
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
      .map(activity => ({
        ...activity,
        timeAgo: getTimeAgo(activity.timestamp)
      }));

    res.json({ activities: sortedActivities });

  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Server error" });
  }
};