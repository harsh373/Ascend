import mongoose from "mongoose";
const arcSchema = new mongoose.Schema({
userId: { type: String, required: true },
title: { type: String, required: true },
theme: { type: String, required: true },
coverPhoto: { type: String, required: true },
archived: { type: Boolean, default: false },
isPrivate: { type: Boolean, default: false },
updates: [
    {
type: {
type: String,
enum: ["reflection", "milestone", "failure", "proof", "comparison"],
required: true
      },
text: { type: String, required: true },
images: {
type: [String],
default: []
      },
likes: {
type: [String],
default: []
      },
comments: [
        {
userId: { type: String, required: true },
userName: { type: String, required: true },
userAvatar: { type: String, default: "" },
text: { type: String, required: true },
createdAt: { type: Date, default: Date.now }
        }
      ],
createdAt: { type: Date, default: Date.now }
    }
  ],
followers: [
    {
userId: { type: String, required: true },
status: { type: String, enum: ["pending", "approved"], default: "approved" },
createdAt: { type: Date, default: Date.now }
    }
  ],
lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
arcSchema.index({ userId: 1 });
arcSchema.index({ lastUpdatedAt: -1 });
export default mongoose.model("Arc", arcSchema);