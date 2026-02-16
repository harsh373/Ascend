import express from "express";
import { getNotifications, markAllAsRead } from "../controllers/notificationController";

const router = express.Router();

router.get("/:userId", getNotifications);
router.post("/read", markAllAsRead);

export default router;