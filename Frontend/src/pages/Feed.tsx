import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { 
  getFeed, 
  likeUpdate, 
  unlikeUpdate, 
  addComment 
} from "../api/arcApi";
import LoadingSkeleton from "../components/LoadingSkelton";
import ImageLightbox from "../components/ImageLightbox";
import FloatingActionButton from "../components/FloatingActionButton";
import InteractionButtons from "../components/InteractionButtons";
import CommentPanel from "../components/CommentPanel";
import { getRelativeTime } from "../utils/dateUtils";
import { getErrorMessage } from "../utils/getErrorMessage";

interface Comment {
  _id?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface FeedItem {
  updateId: string;
  updateType: string;
  updateText: string;
  updateImages: string[];
  updateCreatedAt: string;
  updateLikes: string[];
  updateComments: Comment[];
  arcId: string;
  arcTitle: string;
  arcTheme: string;
  arcCoverPhoto: string;
  arcUserId: string;
  username: string;
  profileImage: string;
}

export default function Feed() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedUpdates, setExpandedUpdates] = useState<Set<string>>(new Set());
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const [activeArcId, setActiveArcId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const loadFeed = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getFeed(user.id);
        setFeedItems(res.data.data);
      } catch (err: unknown) {
        console.error("Error loading feed:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [isLoaded, user]);

  const handleLikeToggle = async (arcId: string, updateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const item = feedItems.find(i => i.updateId === updateId);
    if (!item) return;

    const isLiked = item.updateLikes.includes(user.id);

    setFeedItems(prev =>
      prev.map(i =>
        i.updateId === updateId
          ? {
              ...i,
              updateLikes: isLiked
                ? i.updateLikes.filter(id => id !== user.id)
                : [...i.updateLikes, user.id]
            }
          : i
      )
    );

    try {
      if (isLiked) {
        await unlikeUpdate(arcId, updateId, user.id);
      } else {
        await likeUpdate(arcId, updateId, user.id);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setFeedItems(prev =>
        prev.map(i =>
          i.updateId === updateId
            ? {
                ...i,
                updateLikes: isLiked
                  ? [...i.updateLikes, user.id]
                  : i.updateLikes.filter(id => id !== user.id)
              }
            : i
        )
      );
    }
  };

  const handleReplyClick = (arcId: string, updateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveArcId(arcId);
    setActiveUpdateId(updateId);
    setCommentPanelOpen(true);
  };

  const handleCommentSubmit = async (text: string) => {
    if (!user || !activeArcId || !activeUpdateId) return;

    const userName = user.fullName || user.username || "Anonymous";
    const userAvatar = user.imageUrl || "";

    try {
      await addComment(activeArcId, activeUpdateId, {
        userId: user.id,
        userName,
        userAvatar,
        text
      });

      const res = await getFeed(user.id);
      setFeedItems(res.data.data);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleExpanded = (updateId: string) => {
    setExpandedUpdates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(updateId)) {
        newSet.delete(updateId);
      } else {
        newSet.add(updateId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, updateId: string) => {
    const isExpanded = expandedUpdates.has(updateId);
    if (text.length <= 200 || isExpanded) return text;
    return text.substring(0, 200) + "...";
  };

  const handleCardClick = (arcId: string) => {
    navigate(`/arc/${arcId}`);
  };

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  const openLightbox = (e: React.MouseEvent, images: string[], index: number) => {
    e.stopPropagation();
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        {error}
      </div>
    );
  }

  const activeItem = feedItems.find(i => i.updateId === activeUpdateId);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">
            FEED
          </h1>
          <p className="text-zinc-400 text-lg">
            {feedItems.length === 0 
              ? "Follow an Arc to see progress here."
              : "Witness progress in real-time."
            }
          </p>
        </div>

        {feedItems.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-white mb-2">No updates yet</h3>
            <p className="text-zinc-400 mb-6">Follow arcs to see their progress here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedItems.map((item) => (
              <div
                key={item.updateId}
                onClick={() => handleCardClick(item.arcId)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-zinc-700 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-white flex-1 pr-3">
                    {item.arcTitle}
                  </h2>

                  <button
                    onClick={(e) => handleProfileClick(e, item.arcUserId)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-zinc-800 bg-zinc-900 overflow-hidden hover:border-red-500 transition shrink-0"
                  >
                    {item.profileImage ? (
                      <img
                        src={item.profileImage}
                        alt={item.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                        {item.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </div>

                <p className="text-zinc-200 text-base sm:text-lg mb-4 whitespace-pre-wrap">
                  {truncateText(item.updateText, item.updateId)}
                </p>

                {item.updateText.length > 200 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(item.updateId);
                    }}
                    className="text-red-500 hover:text-red-400 text-sm font-semibold mb-4"
                  >
                    {expandedUpdates.has(item.updateId) ? "Show less" : "Read more"}
                  </button>
                )}

                {item.updateImages && item.updateImages.length > 0 && (
                  <div className={`grid gap-4 mb-4 ${item.updateImages.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {item.updateImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-full aspect-video overflow-hidden rounded-lg border border-zinc-700 hover:border-red-500 transition cursor-pointer"
                        onClick={(e) => openLightbox(e, item.updateImages, idx)}
                      >
                        <img
                          src={img}
                          alt={`Update image ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-semibold uppercase">
                    {capitalizeFirst(item.updateType)}
                  </span>
                  <span>•</span>
                  <span>{getRelativeTime(item.updateCreatedAt)}</span>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <InteractionButtons
                    updateId={item.updateId}
                    isLiked={item.updateLikes.includes(user?.id || "")}
                    onLike={(e) => handleLikeToggle(item.arcId, item.updateId, e)}
                    onReply={(e) => handleReplyClick(item.arcId, item.updateId, e)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {user && <FloatingActionButton userId={user.id} />}

      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxImages([])}
        />
      )}

      <CommentPanel
        isOpen={commentPanelOpen}
        comments={activeItem?.updateComments || []}
        onClose={() => setCommentPanelOpen(false)}
        onSubmit={handleCommentSubmit}
      />
    </div>
  );
}