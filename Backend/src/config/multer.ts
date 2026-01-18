import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";


const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "ascend",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  }) as any,   
});

export const upload = multer({ storage });
