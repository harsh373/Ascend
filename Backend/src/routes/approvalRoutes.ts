import express from "express";
import { voteTask } from "../controllers/approvalController";

const router = express.Router();

router.post("/vote", voteTask);

export default router;
