import { Request, Response } from "express";
import { Habit } from "../models/habitModel";
import { User } from "../models/userModel";

// Create Habits (Onboarding)
export const createHabits = async (req: Request, res: Response) => {
  try {
    const { userId, habits } = req.body;

    if (!habits || habits.length < 3) {
      return res.status(400).json({ message: "Minimum 3 habits required" });
    }

    const cleanHabits = habits
      .map((h: string) => h.trim())
      .filter((h: string) => h.length >= 3 && h.length <= 50);

    if (cleanHabits.length < 3) {
      return res.status(400).json({ message: "Invalid habit names" });
    }

    await Habit.deleteMany({ userId });

    const docs = cleanHabits.map((title: string) => ({
      userId,
      title,
      streak: 0,
      lastCompleted: null
    }));

    await Habit.insertMany(docs);

    res.json({ message: "Habits created successfully" });
  } catch (err) {
    console.error("Create habits error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Habits
export const getHabits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const habits = await Habit.find({ userId }).sort({ createdAt: 1 });

    res.json(habits);
  } catch (err) {
    console.error("Get habits error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Complete Habit (Daily)
export const completeHabit = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;

    if (!habitId) {
      return res.status(400).json({ message: "habitId is required" });
    }

    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
  
    const lastCompletedStart = habit.lastCompleted 
      ? new Date(
          habit.lastCompleted.getFullYear(), 
          habit.lastCompleted.getMonth(), 
          habit.lastCompleted.getDate()
        )
      : null;

    
    if (lastCompletedStart && todayStart.getTime() === lastCompletedStart.getTime()) {
      return res.status(400).json({ message: "Already completed today" });
    }

    
    if (lastCompletedStart) {
      const daysDiff = Math.floor(
        (todayStart.getTime() - lastCompletedStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
   
        habit.streak += 1;
      } else if (daysDiff > 1) {
        
        habit.streak = 1;
      }
      
    } else {
      
      habit.streak = 1;
    }

    habit.lastCompleted = now;
    await habit.save();

    const xpGain = 10 + habit.streak * 2;

    await User.findOneAndUpdate(
      { clerkUserId: habit.userId },
      { $inc: { xp: xpGain } }
    );

    res.json({
      message: "Habit completed",
      streak: habit.streak,
      xpGained: xpGain,
    });
  } catch (err) {
    console.error("Complete habit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//update habit controller

export const updateHabit = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const { title } = req.body;

    if (!title || title.trim().length < 3 || title.trim().length > 50) {
      return res.status(400).json({ message: "Title must be 3-50 characters" });
    }

    const habit = await Habit.findByIdAndUpdate(
      habitId,
      { title: title.trim() },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json({ message: "Habit updated", habit });
  } catch (err) {
    console.error("Update habit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//delete habit for the user

export const deleteHabit = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findByIdAndDelete(habitId);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    console.error("Delete habit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//adding single habit controller for more after updating

export const addHabit = async (req: Request, res: Response) => {
  try {
    const { userId, title } = req.body;

    if (!title || title.trim().length < 3 || title.trim().length > 50) {
      return res.status(400).json({ message: "Title must be 3-50 characters" });
    }

    const habit = await Habit.create({
      userId,
      title: title.trim(),
      streak: 0,
      lastCompleted: null
    });

    res.json({ message: "Habit added", habit });
  } catch (err) {
    console.error("Add habit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
