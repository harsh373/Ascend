import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes"
import { connectDB } from "./config/db";
import { clerkMiddleware } from '@clerk/express';
import taskRoutes from "./routes/taskRoutes"
import friendRoutes from "./routes/friendRoutes"
import leaderboardRoutes from "./routes/leaderboardRoutes"
import heavyTaskRoutes from "./routes/heavyTaskRoutes"
import approvalRoutes from "./routes/approvalRoutes"
import habitRoutes from "./routes/habitRoutes"
import challengeRoutes from "./routes/challengeRoutes"
import profileRoutes from "./routes/profileRoutes"
import feedRoutes from "./routes/arcRoutes"
import arcRoutes from "./routes/arcRoutes"
import notificationRoutes from "./routes/notificationRoutes"

const app = express();

app.use(cors());
app.use(express.json());

let isConnected = false;

app.use(async (_req, _res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

app.use(clerkMiddleware());

app.get("/", (req: Request, res: Response) => {
  res.send("Ascend API is running ");
});

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/heavy-task", heavyTaskRoutes);
app.use("/api/approval", approvalRoutes);
app.use("/api/habits", habitRoutes)
app.use("/api/challenges", challengeRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/feed",feedRoutes)
app.use("/api/arcs",arcRoutes)
app.use("/api/notifications", notificationRoutes)

export default app;