import express from "express";
import {
createArc,
uploadArcCoverPhoto,
getUserArcs,
getArcById,
addArcUpdate,
uploadArcUpdateImages,
updateArc,
archiveArc,
unarchiveArc,
toggleArcPrivacy,
followArc,
unfollowArc,
approveFollower,
rejectFollower,
getPendingFollowers,
getFollowedArcs,
likeUpdate,
unlikeUpdate,
addComment
} from "../controllers/arcController";
import { upload } from "../config/multer";
import { getFeed } from "../controllers/feedController";
const router = express.Router();
router.post("/create", createArc);
router.post("/upload-cover", upload.single("cover"), uploadArcCoverPhoto);
router.get("/user/:userId", getUserArcs);
router.get("/:arcId", getArcById);
router.post("/:arcId/update", addArcUpdate);
router.post("/:arcId/upload-images", upload.array("images", 2), uploadArcUpdateImages);
router.put("/:arcId", updateArc);
router.get("/feed/:userId", getFeed);
router.post("/:arcId/archive", archiveArc);
router.post("/:arcId/unarchive", unarchiveArc);
router.post("/:arcId/toggle-privacy", toggleArcPrivacy);
router.post("/:arcId/follow", followArc);
router.post("/:arcId/unfollow", unfollowArc);
router.post("/:arcId/approve-follower", approveFollower);
router.post("/:arcId/reject-follower", rejectFollower);
router.get("/:arcId/pending-followers", getPendingFollowers);
router.get("/followed/:userId", getFollowedArcs);
router.post("/:arcId/updates/:updateId/like", likeUpdate);
router.post("/:arcId/updates/:updateId/unlike", unlikeUpdate);
router.post("/:arcId/updates/:updateId/comment", addComment);
export default router;