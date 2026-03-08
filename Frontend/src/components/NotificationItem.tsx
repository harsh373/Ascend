import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import type { Notification } from "../api/notificationApi";
import { respondToInvite } from "../api/notificationApi";
import { getRelativeTime } from "../utils/dateUtils";

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
  onRefresh: () => void;
}

export default function NotificationItem({ notification, onClose, onRefresh }: NotificationItemProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);

  const getMessage = () => {
    const { type, sender, arc_title } = notification;
    switch (type) {
      case "LIKE":
        return `${sender.name} liked your update`;
      case "COMMENT":
        return `${sender.name} commented on your update`;
      case "FOLLOW_ARC":
        return `${sender.name} followed your arc`;
      case "FOLLOW_REQUEST":
        return `${sender.name} requested to follow your arc`;
      case "FOLLOW_APPROVED":
        return `${sender.name} approved your follow request`;
      case "ARC_INVITE":
        return `${sender.name} invited you to follow their arc${arc_title ? ` "${arc_title}"` : ""}`;
      default:
        return "";
    }
  };

  const handleClick = () => {
    const { type, entity_id } = notification;

    if (type === "ARC_INVITE") return;

    onClose();

    if (type === "COMMENT") {
      const [arcId, updateId] = entity_id.split(":");
      navigate(`/arc/${arcId}`, { state: { openCommentPanel: true, updateId } });
    } else if (type === "LIKE") {
      const arcId = entity_id.split(":")[0];
      navigate(`/arc/${arcId}`);
    } else if (type === "FOLLOW_ARC" || type === "FOLLOW_REQUEST" || type === "FOLLOW_APPROVED") {
      navigate(`/arc/${entity_id}`);
    }
  };

  const handleRespond = async (accept: boolean) => {
    if (!user) return;
    try {
      setResponding(true);
      const res = await respondToInvite(notification.id, user.id, accept);
      setResponded(true);
      onRefresh();
      if (accept && res.data.arcId) {
        onClose();
        navigate(`/arc/${res.data.arcId}`);
      }
    } catch (err) {
      console.error("Error responding to invite:", err);
    } finally {
      setResponding(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-3 rounded-lg transition ${
        notification.type !== "ARC_INVITE" ? "hover:bg-zinc-800 cursor-pointer" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-800">
        {notification.sender.avatar_url ? (
          <img
            src={notification.sender.avatar_url}
            alt={notification.sender.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-bold">
            {notification.sender.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200">{getMessage()}</p>
        <p className="text-xs text-zinc-500 mb-2">{getRelativeTime(notification.created_at)}</p>

        {notification.type === "ARC_INVITE" && !responded && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleRespond(true); }}
              disabled={responding}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRespond(false); }}
              disabled={responding}
              className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        )}

        {notification.type === "ARC_INVITE" && responded && (
          <p className="text-xs text-zinc-500 mt-1">Responded</p>
        )}
      </div>
    </div>
  );
}