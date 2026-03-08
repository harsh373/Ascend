import express from "express";
import { getNotifications, markAllAsRead, respondToInvite } from "../controllers/notificationController";

const router = express.Router();

router.get("/:userId", getNotifications);
router.post("/read", markAllAsRead);
router.post("/invite-respond", respondToInvite);

export default router;