import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  challengerId: String,
  opponentId: String,

  
  challengerName: { type: String, default: "" },
  challengerPhoto: { type: String, default: "" },
  opponentName: { type: String, default: "" },
  opponentPhoto: { type: String, default: "" },

  title: String,
  xpReward: { type: Number, required: true, default: 50 },

  requiresProof: Boolean,
  proof: String,

  status: {
    type: String,
    enum: ["pending", "accepted", "submitted", "approved", "failed", "rejected"],
    default: "pending",
  },

  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Challenge", challengeSchema);
