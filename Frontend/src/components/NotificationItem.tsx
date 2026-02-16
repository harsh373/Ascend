import { useNavigate } from "react-router-dom";
import type { Notification } from "../api/notificationApi";
import { getRelativeTime } from "../utils/dateUtils";

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const navigate = useNavigate();

  const getMessage = () => {
    const { type, sender } = notification;
    switch (type) {
      case "LIKE":
        return `${sender.name} liked your update`;
      case "COMMENT":
        return `${sender.name} commented on your update`;
      case "FOLLOW_ARC":
        return `${sender.name} followed your arc`;
      default:
        return "";
    }
  };

  const handleClick = () => {
    const { type, entity_id } = notification;
    
    onClose();

    if (type === "COMMENT") {
      const [arcId, updateId] = entity_id.split(":");
      navigate(`/arc/${arcId}`, { state: { openCommentPanel: true, updateId } });
    } else if (type === "LIKE") {
      const arcId = entity_id.split(":")[0];
      navigate(`/arc/${arcId}`);
    } else if (type === "FOLLOW_ARC") {
      navigate(`/arc/${entity_id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-3 hover:bg-zinc-800 transition cursor-pointer rounded-lg"
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
        <p className="text-sm text-zinc-200 truncate">{getMessage()}</p>
        <p className="text-xs text-zinc-500">{getRelativeTime(notification.created_at)}</p>
      </div>
    </div>
  );
}