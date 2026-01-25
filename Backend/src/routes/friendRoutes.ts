import express from "express";
import {
  searchUsers,
  sendRequest,
  acceptRequest,
  getFriends,
  getSentRequests,
} from "../controllers/friendController";

const router = express.Router();

router.get("/search", searchUsers);
router.post("/request", sendRequest);
router.post("/accept", acceptRequest);
router.get("/list/:userId", getFriends);
router.get("/sent/:userId", getSentRequests);

export default router;
