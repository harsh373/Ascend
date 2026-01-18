import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/userRoutes"
import { connectDB } from "./config/db";
import taskRoutes from "./routes/taskRoutes"
import friendRoutes from "./routes/friendRoutes"
import leaderboardRoutes from "./routes/leaderboardRoutes"
import heavyTaskRoutes from "./routes/heavyTaskRoutes"
import approvalRoutes from "./routes/approvalRoutes"
import habitRoutes from "./routes/habitRoutes"
import challengeRoutes from "./routes/challengeRoutes"



const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

connectDB();


app.post("/direct-test", (req, res) => {
  console.log("DIRECT TEST HIT");
  res.send("Direct route works");
});



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
app.use("/api/challenges",challengeRoutes)




const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
