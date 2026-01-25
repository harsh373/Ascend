import express from "express";
import { getFeed } from "../controllers/feedController";

const router = express.Router();


router.get("/:userId", getFeed);

export default router;