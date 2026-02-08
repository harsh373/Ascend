import { Request, Response } from "express";
import Task from "../models/taskModel";
import { User } from "../models/userModel";

export const voteTask = async (req: Request, res: Response) => {
  const { taskId, userId, vote } = req.body;

  if (!taskId || !userId || !vote) {
    return res.status(400).json({ message: "Missing data" });
  }

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (!task.reviewers.includes(userId)) {
    return res.status(403).json({ message: "Not your task to review" });
  }

  if (task.votedBy?.includes(userId)) {
    return res.status(409).json({ message: "Already voted" });
  }

  if (!task.votes) task.votes = { approve: 0, reject: 0 };

  if (vote === "approve") task.votes.approve += 1;
  if (vote === "reject") task.votes.reject += 1;

  task.votedBy.push(userId);

  await User.findOneAndUpdate(
    { clerkUserId: userId },
    { $inc: { xp: 5 } }
  );

  if (task.votes.approve >= 2) {
    task.status = "approved";
    await User.findOneAndUpdate(
      { clerkUserId: task.userId },
      { $inc: { xp: task.xp } }
    );
  }

  if (task.votes.reject >= 2) {
    task.status = "rejected";
  }

  await task.save();
  res.json({ message: "Vote recorded", task });
};
