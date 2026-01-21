import express, { RequestHandler } from "express";
import { 
  getPublicProfile, 
  togglePrivacy, 
  getUserTasks, 
  getUserChallenges 
} from "../controllers/profileController";

const router = express.Router();


router.get("/:userId", getPublicProfile as unknown as RequestHandler);


router.patch("/privacy", togglePrivacy as unknown as RequestHandler);


router.get("/:userId/tasks", getUserTasks as unknown as RequestHandler);

router.get("/:userId/challenges", getUserChallenges as unknown as RequestHandler);

export default router;