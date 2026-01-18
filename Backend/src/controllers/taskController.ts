import { Request, Response } from "express";
import Task from "../models/taskModel";
import { User } from "../models/userModel";


export const createTask = async (req: any, res: any) => {
  try {
    const { userId, title } = req.body;

    if (!userId || !title ) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const task = await Task.create({ userId, title, xp:10});

    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserTasks = async (req: any, res: any) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const completeTask = async (req: any, res: any) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.status === "approved") {
      return res.status(400).json({ message: "Already completed" });
    }

    task.status = "approved";
    await task.save();

    const user = await User.findOne({ clerkUserId: task.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.xp += task.xp;
    user.level = Math.floor(user.xp / 100) + 1;

    await user.save();

    res.json({ task, user });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasksToReview = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const tasks = await Task.find({
      reviewers: userId,
      status: "waiting",
      votedBy: { $ne: userId } 
    });

    res.json(tasks);
  } catch (error) {
    console.error("Review fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

