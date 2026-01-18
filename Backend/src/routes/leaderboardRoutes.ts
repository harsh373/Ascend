import express from "express";
import {
  getGlobalLeaderboard,
  getFriendsLeaderboard,
} from "../controllers/leaderboardController";

const router = express.Router();

router.get("/global", getGlobalLeaderboard);
router.get("/friends/:userId", getFriendsLeaderboard);

export default router;
