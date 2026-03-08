import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  receiverId: { type: String, required: true },
  senderId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["LIKE", "COMMENT", "FOLLOW_ARC", "FOLLOW_REQUEST", "FOLLOW_APPROVED", "ARC_INVITE"],
    required: true 
  },
  entityId: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ receiverId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);