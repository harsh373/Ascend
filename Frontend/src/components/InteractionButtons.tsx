import { useState } from "react";
import { ThumbsUp, MessageCircle } from "lucide-react";

interface InteractionButtonsProps {
  updateId: string;
  isLiked: boolean;
  onLike: (e: React.MouseEvent) => void;
  onReply: (e: React.MouseEvent) => void;
}

export default function InteractionButtons({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateId,
  isLiked,
  onLike,
  onReply
}: InteractionButtonsProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    setIsAnimating(true);
    onLike(e);
    setTimeout(() => setIsAnimating(false), 120);
  };

  return (
    <div className="flex items-center gap-4 pt-2.5 pb-1">
      <button
        onClick={handleLikeClick}
        className={`transition-all duration-120 ${
          isAnimating ? "scale-[0.92]" : "scale-100"
        }`}
      >
        <ThumbsUp
          size={20}
          className={`transition-colors ${
            isLiked ? "text-red-500 fill-red-500" : "text-zinc-500"
          }`}
          strokeWidth={1.5}
        />
      </button>

      <button
        onClick={onReply}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors"
      >
        <MessageCircle size={20} strokeWidth={1.5} />
        <span className="text-sm font-medium">Reply</span>
      </button>
    </div>
  );
}