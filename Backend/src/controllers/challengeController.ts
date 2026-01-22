import Challenge from "../models/challenge";
import { Request, Response } from "express";
import { User } from "../models/userModel";
import cloudinary from "../config/cloudinary";

//create challenge

export const createChallenge = async (req: Request, res: Response) => {
  const { challengerId, opponentId, title, xpReward, requiresProof, hours } = req.body;

  
  if (!xpReward || xpReward < 1 || xpReward > 50) {
    return res.status(400).json({ 
      error: 'XP reward must be between 1 and 50' 
    });
  }

  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!hours || hours < 1) {
    return res.status(400).json({ error: 'Challenge duration must be at least 1 hour' });
  }

  
  const challenger = await User.findOne({ clerkUserId: challengerId });
  const opponent = await User.findOne({ clerkUserId: opponentId });

  if (!challenger) {
    return res.status(404).json({ error: 'Challenger user not found' });
  }

  if (!opponent) {
    return res.status(404).json({ error: 'Opponent user not found' });
  }

  const challenge = await Challenge.create({
    challengerId,
    opponentId,
    challengerName: challenger.fullName,
    challengerPhoto: challenger.profileImage,
    opponentName: opponent.fullName,
    opponentPhoto: opponent.profileImage,
    title,
    xpReward,
    requiresProof,
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000)
  });

  res.json(challenge);
};

//Respond to challenge

export const respondToChallenge = async (req: Request, res: Response) => {
  const { challengeId, accept } = req.body;

  const ch = await Challenge.findById(challengeId);
  if (!ch) return res.status(404).json({ message: "Not found" });

  ch.status = accept ? "accepted" : "rejected";
  await ch.save();

  res.json({ message: "Response recorded" });
};

//Submit challenge controller

export const submitChallenge = async (req: Request, res: Response) => {
  const { challengeId, proof } = req.body;

  const ch = await Challenge.findById(challengeId);
  if (!ch) return res.status(404).json({ message: "Not found" });

  if (ch.requiresProof && !proof) {
    return res.status(400).json({ message: "Proof required" });
  }

  ch.status = "submitted";
  ch.proof = proof;

  await ch.save();
  res.json({ message: "Proof submitted" });
};

//review and approval controller

export const reviewChallenge = async (req: Request, res: Response) => {
  const { challengeId, approve } = req.body;

  const ch = await Challenge.findById(challengeId);
  if (!ch) return res.status(404).json({ message: "Not found" });

  if (approve) {
    ch.status = "approved";

    const user = await User.findOne({ clerkUserId: ch.opponentId });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.xp += ch.xpReward;
    user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;  // ✅ FIXED FORMULA

    await user.save();
  } else {
    ch.status = "failed";

    const penalty = Math.floor(ch.xpReward * 0.05);

    const user = await User.findOne({ clerkUserId: ch.opponentId });  
    if (!user) return res.status(404).json({ message: "User not found" });

    user.xp -= penalty;
    user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1; 

    await user.save();
  }

  await ch.save();
  res.json({ message: "Review completed" });
};

//auto expiry controller
const failExpiredChallenges = async () => {
  const expired = await Challenge.find({
    status: "accepted",
    expiresAt: { $lt: new Date() }
  });

  for (let ch of expired) {
    ch.status = "failed";

    const penalty = Math.floor(ch.xpReward * 0.05);

    const user = await User.findOne({ clerkUserId: ch.challengerId });
    if (!user) continue;

    user.xp -= penalty;
    user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;

    await user.save();
    await ch.save();
  }
};


//get all the challenges to

export const getChallenges = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const challenges = await Challenge.find({
    $or: [
      { challengerId: userId },
      { opponentId: userId }
    ]
  }).sort({ createdAt: -1 });

  res.json(challenges);
};


//proof  controller to get to know

export const uploadChallengeProof = async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // multer-storage-cloudinary 
    challenge.proof = req.file.path;   
    challenge.status = "submitted";

    await challenge.save();

    res.json({
      message: "Proof uploaded successfully",
      proof: req.file.path,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};