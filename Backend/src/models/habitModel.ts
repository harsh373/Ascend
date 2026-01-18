import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  streak: { type: Number, default: 0 },
  lastCompleted: { type: Date, default: null }
}, { timestamps: true });

export const Habit = mongoose.model("Habit", habitSchema);
