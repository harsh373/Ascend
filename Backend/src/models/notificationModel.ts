import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  receiverId: { type: String, required: true },
  senderId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["LIKE", "COMMENT", "FOLLOW_ARC"],
    required: true 
  },
  entityId: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ receiverId: 1, createdAt: -1 });
notificationSchema.index({ receiverId: 1, senderId: 1, type: 1, entityId: 1 }, { unique: true });

export default mongoose.model("Notification", notificationSchema);