import express from "express";
import { createTask, getUserTasks, completeTask,getTasksToReview } from "../controllers/taskController";

const router = express.Router();

router.post("/create", createTask);
router.get("/user/:userId", getUserTasks);
router.post("/complete/:taskId", completeTask);
router.get("/review/:userId", getTasksToReview);

export default router;
