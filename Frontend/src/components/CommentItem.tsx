import { useNavigate } from "react-router-dom";
import { getRelativeTime } from "../utils/dateUtils";

interface CommentItemProps {
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export default function CommentItem({
  userId,
  userName,
  userAvatar,
  text,
  createdAt
}: CommentItemProps) {
  const navigate = useNavigate();

  const getInitial = () => {
    return userName.charAt(0).toUpperCase();
  };

  const handleProfileClick = () => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="flex gap-2.5">
      <button
        onClick={handleProfileClick}
        className="w-7 h-7 rounded-full bg-zinc-800 border border-white/6 flex items-center justify-center text-sm font-bold text-zinc-400 shrink-0 hover:border-red-500 transition cursor-pointer"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitial()
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <button
            onClick={handleProfileClick}
            className="font-bold text-white text-sm hover:text-red-400 transition"
          >
            {userName}
          </button>
          <span className="text-zinc-500 text-xs">
            {getRelativeTime(createdAt)}
          </span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          {text}
        </p>
      </div>
    </div>
  );
}