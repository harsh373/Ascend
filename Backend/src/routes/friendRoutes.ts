import express from "express";
import {
  searchUsers,
  sendRequest,
  acceptRequest,
  getFriends,
} from "../controllers/friendController";

const router = express.Router();

router.get("/search", searchUsers);
router.post("/request", sendRequest);
router.post("/accept", acceptRequest);
router.get("/list/:userId", getFriends);

export default router;
