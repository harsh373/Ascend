import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { createUser, getFriendRequests, getUserProfile,uploadAvatar} from "../controllers/userController";
import { upload } from "../config/multer";



const router = Router();

router.get("/me", protect, (req, res) => {
  res.json({ message: "You are authenticated" });
});

router.post("/create", createUser);
router.get("/requests/:userId", getFriendRequests); 
router.get("/:userId", getUserProfile);
router.post("/upload-avatar", upload.single("image"), uploadAvatar);


export default router;
