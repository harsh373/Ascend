import { Request, Response } from "express";
import Task from "../models/taskModel";
import { User } from "../models/userModel";

export const submitHeavyTask = async (req: Request, res: Response) => {
  try {
    const { userId, title, xp, proof, proofType } = req.body;

    if (!userId || !title || !proof) {
      return res.status(400).json({ message: "Missing data" });
    }

    // 1. Find 3 random users (excluding creator)
    const users = await User.find({ clerkUserId: { $ne: userId } })
      .limit(3)
      .select("clerkUserId");

    const reviewers = users.map(u => u.clerkUserId);

    // 2. Create heavy task with reviewers
    const task = await Task.create({
      userId,
      title,
      xp: xp || 50,
      proof,
      proofType: proofType || "text",
      status: "waiting",
      reviewers,
      votes: { approve: 0, reject: 0 },
      votedBy: []
    });

    res.json({ message: "Heavy task submitted", task });

  } catch (error) {
    console.error("Heavy task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




const assignRandomReviewers = async (creatorId: string) => {
  const users = await User.find({ clerkUserId: { $ne: creatorId } })
    .select("clerkUserId")
    .limit(10);

  const shuffled = users.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map(u => u.clerkUserId);
}; 


//for uploading of image

export const uploadHeavyProof = async (req: any, res: Response) => {
  try {
    const { taskId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = req.file.path;

    await Task.findByIdAndUpdate(taskId, {
      proof: imageUrl,
      proofType: "image"
    });

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Proof upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};



