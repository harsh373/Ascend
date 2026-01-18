import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    xp: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "waiting", "approved", "rejected"],
      default: "pending",
    },
    proof: {
  type: String,
  default: "",
},

proofType: {
  type: String, // "text" | "link" | "image"
  default: "",
},


reviewers: {
  type: [String], // clerkUserIds
  default: [],
},

votes: {
  approve: { type: Number, default: 0 },
  reject: { type: Number, default: 0 },
  _id: false,
 
    },
votedBy: {
  type: [String], // clerkUserIds who already voted
  default: [],
},

  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
