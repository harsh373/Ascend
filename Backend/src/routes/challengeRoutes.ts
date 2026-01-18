import express from "express";
import { createChallenge,respondToChallenge,submitChallenge,reviewChallenge,getChallenges,uploadChallengeProof } from "../controllers/challengeController";
import {upload} from "../config/multer";
const router = express.Router();

router.post("/create", createChallenge);
router.post("/respond", respondToChallenge);
router.post("/submit", submitChallenge);
router.post("/review", reviewChallenge);
router.get("/:userId", getChallenges);
router.post(
  "/upload-proof",
  upload.single("image"),
  uploadChallengeProof
);

export default router