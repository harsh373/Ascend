import express from "express";
import { submitHeavyTask, uploadHeavyProof } from "../controllers/heavyTaskController";
import { upload } from "../config/multer";


const router = express.Router();

router.post("/submit", submitHeavyTask);
router.post(
  "/upload-proof",
  upload.single("image"),
  uploadHeavyProof
);



export default router;
