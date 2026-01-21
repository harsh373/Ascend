import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  fullName: { type: String, required: true },
  profileImage: { type: String, default: "" },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  friends: {
  type: [String], 
    default: [],
  
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
  longestStreak: { type: Number, default: 0 },

friendRequests: {
  type: [String], 
  default: [],
  },

  isPublic: { 
    type: Boolean, 
    default: true  
  },
},{timestamps:true});

export const User = mongoose.model("User", userSchema);
