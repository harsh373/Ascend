import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { 
  getArcById, 
  followArc, 
  unfollowArc, 
  archiveArc, 
  unarchiveArc,
  toggleArcPrivacy,
  approveFollower,
  rejectFollower,
  getPendingFollowers,
  likeUpdate,
  unlikeUpdate,
  addComment,
  type PendingFollower
} from "../api/arcApi";
import { getUserProfile } from "../api/userApi";
import AddArcUpdate from "../components/AddArcUpdate";
import ImageLightbox from "../components/ImageLightbox";
import LoadingSkeleton from "../components/LoadingSkelton";
import InteractionButtons from "../components/InteractionButtons";
import CommentPanel from "../components/CommentPanel";
import { getRelativeTime } from "../utils/dateUtils";

interface Comment {
  _id?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface ArcUpdate {
  _id: string;
  type: string;
  text: string;
  images: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface Follower {
  userId: string;
  status: "pending" | "approved";
  createdAt: string;
}

interface Arc {
  _id: string;
  userId: string;
  title: string;
  theme: string;
  coverPhoto: string;
  archived: boolean;
  isPrivate: boolean;
  updates: ArcUpdate[];
  followers: Follower[];
  lastUpdatedAt: string;
  createdAt: string;
}

export default function ArcPage() {
  const { arcId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [arc, setArc] = useState<Arc | null>(null);
  const [arcOwnerProfile, setArcOwnerProfile] = useState<{ username: string; profileImage: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [expandedUpdates, setExpandedUpdates] = useState<Set<string>>(new Set());
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const [pendingFollowers, setPendingFollowers] = useState<PendingFollower[]>([]);

  useEffect(() => {
    const loadArc = async () => {
      if (!arcId || !user) return;
      try {
        setLoading(true);
        const res = await getArcById(arcId, user.id);
        const arcData = res.data.data;
        setArc(arcData);

        if (arcData.userId) {
          try {
            const profileRes = await getUserProfile(arcData.userId);
            setArcOwnerProfile({
              username: profileRes.data.username,
              profileImage: profileRes.data.profileImage
            });
          } catch (err) {
            console.error("Error loading arc owner profile:", err);
          }
        }

        if (arcData.userId === user.id && arcData.isPrivate) {
          try {
            const pendingRes = await getPendingFollowers(arcId);
            setPendingFollowers(pendingRes.data.data);
          } catch (err) {
            console.error("Error loading pending followers:", err);
          }
        }
      } catch (error) {
        console.error("Error loading arc:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArc();
  }, [arcId, user]);

  useEffect(() => {
    if (location.state?.openCommentPanel && location.state?.updateId) {
      setActiveUpdateId(location.state.updateId);
      setCommentPanelOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadArc = async () => {
    if (!arcId || !user) return;
    try {
      setLoading(true);
      const res = await getArcById(arcId, user.id);
      const arcData = res.data.data;
      setArc(arcData);

      if (arcData.userId) {
        try {
          const profileRes = await getUserProfile(arcData.userId);
          setArcOwnerProfile({
            username: profileRes.data.username,
            profileImage: profileRes.data.profileImage
          });
        } catch (err) {
          console.error("Error loading arc owner profile:", err);
        }
      }

      if (arcData.userId === user.id && arcData.isPrivate) {
        try {
          const pendingRes = await getPendingFollowers(arcId);
          setPendingFollowers(pendingRes.data.data);
        } catch (err) {
          console.error("Error loading pending followers:", err);
        }
      }
    } catch (error) {
      console.error("Error loading arc:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (updateId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!arc || !user) return;

    const update = arc.updates.find(u => u._id === updateId);
    if (!update) return;

    const isLiked = update.likes.includes(user.id);

    setArc(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        updates: prev.updates.map(u =>
          u._id === updateId
            ? {
                ...u,
                likes: isLiked
                  ? u.likes.filter(id => id !== user.id)
                  : [...u.likes, user.id]
              }
            : u
        )
      };
    });

    try {
      if (isLiked) {
        await unlikeUpdate(arc._id, updateId, user.id);
      } else {
        await likeUpdate(arc._id, updateId, user.id);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setArc(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          updates: prev.updates.map(u =>
            u._id === updateId
              ? {
                  ...u,
                  likes: isLiked
                    ? [...u.likes, user.id]
                    : u.likes.filter(id => id !== user.id)
                }
              : u
          )
        };
      });
    }
  };

  const handleReplyClick = (updateId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveUpdateId(updateId);
    setCommentPanelOpen(true);
  };

  const handleCommentSubmit = async (text: string) => {
    if (!arc || !user || !activeUpdateId) return;

    const userName = user.fullName || user.username || "Anonymous";
    const userAvatar = user.imageUrl || "";

    try {
      await addComment(arc._id, activeUpdateId, {
        userId: user.id,
        userName,
        userAvatar,
        text
      });

      loadArc();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handlePrivacyToggle = async () => {
    if (!arc || !user) return;

    try {
      await toggleArcPrivacy(arc._id);
      loadArc();
    } catch (error) {
      console.error("Error toggling privacy:", error);
    }
  };

  const handleApproveFollower = async (userId: string) => {
    if (!arc) return;

    try {
      await approveFollower(arc._id, userId);
      loadArc();
    } catch (error) {
      console.error("Error approving follower:", error);
    }
  };

  const handleRejectFollower = async (userId: string) => {
    if (!arc) return;

    try {
      await rejectFollower(arc._id, userId);
      loadArc();
    } catch (error) {
      console.error("Error rejecting follower:", error);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!arc) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Arc not found
      </div>
    );
  }

  const myFollowerStatus = arc.followers.find(f => f.userId === user?.id);
  const isFollowing = !!myFollowerStatus;
  const isPending = myFollowerStatus?.status === "pending";
  const isApproved = myFollowerStatus?.status === "approved";
  const isOwner = arc.userId === user?.id;

  const canViewUpdates = isOwner || !arc.isPrivate || isApproved;

  const handleFollowToggle = async () => {
    if (!arc || !user) return;

    try {
      if (isFollowing) {
        await unfollowArc(arc._id, user.id);
      } else {
        await followArc(arc._id, user.id);
      }
      loadArc();
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleArchiveToggle = async () => {
    if (!arc || !user) return;

    const confirmed = window.confirm(
      arc.archived
        ? "Are you sure you want to unarchive this arc?"
        : "Are you sure you want to archive this arc? You won't be able to add new updates."
    );

    if (!confirmed) return;

    try {
      if (arc.archived) {
        await unarchiveArc(arc._id);
      } else {
        await archiveArc(arc._id);
      }
      loadArc();
    } catch (error) {
      console.error("Error toggling archive:", error);
    }
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const handleProfileClick = () => {
    if (arc?.userId) {
      navigate(`/profile/${arc.userId}`);
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case "milestone": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "failure": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "proof": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "comparison": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
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

  const activeUpdate = arc.updates.find(u => u._id === activeUpdateId);

  const getFollowButtonText = () => {
    if (!arc.isPrivate) {
      return isFollowing ? "Unfollow" : "Follow";
    }
    if (isPending) return "Pending Approval";
    if (isApproved) return "Following";
    return "Request to Follow";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <div
        className="relative h-64 sm:h-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${arc.coverPhoto})` }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        
        <div className="absolute top-4 right-4 flex gap-3">
          <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs sm:text-sm font-semibold uppercase">
            {arc.theme}
          </span>

          {arc.isPrivate && (
            <button
              onClick={isOwner ? handlePrivacyToggle : undefined}
              className={`px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs sm:text-sm font-semibold uppercase ${
                isOwner ? 'hover:bg-purple-500/30 cursor-pointer transition' : 'cursor-default'
              }`}
            >
              🔒 Private
            </button>
          )}

          {!arc.isPrivate && isOwner && (
            <button
              onClick={handlePrivacyToggle}
              className="px-3 py-1 bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 rounded-lg text-xs sm:text-sm font-semibold uppercase hover:bg-zinc-500/30 cursor-pointer transition"
            >
              🌐 Public
            </button>
          )}
          
          {arc.archived && (
            <span className="px-3 py-1 bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 rounded-lg text-xs sm:text-sm font-semibold uppercase">
              Archived
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
          <div className="max-w-4xl mx-auto flex items-end justify-between gap-4">
            <h1 className="text-4xl sm:text-6xl font-black text-white drop-shadow-lg">
              {arc.title}
            </h1>

            {arcOwnerProfile && (
              <button
                onClick={handleProfileClick}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-zinc-950 bg-zinc-900 overflow-hidden hover:border-red-500 transition shrink-0 shadow-lg"
              >
                {arcOwnerProfile.profileImage ? (
                  <img
                    src={arcOwnerProfile.profileImage}
                    alt={arcOwnerProfile.username || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-400">
                    {arcOwnerProfile.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
          <div className="flex gap-6 text-sm sm:text-base">
            <div>
              <span className="text-zinc-500 font-semibold">Updates</span>
              <p className="text-white text-xl font-bold">{arc.updates.length}</p>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold">Followers</span>
              <p className="text-white text-xl font-bold">{arc.followers.length}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {isOwner ? (
              <>
                {!arc.archived && (
                  <button
                    onClick={() => setShowAddUpdate(true)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition"
                  >
                    + Add Update
                  </button>
                )}
                <button
                  onClick={handleArchiveToggle}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold transition"
                >
                  {arc.archived ? "Unarchive" : "Archive"}
                </button>
              </>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={isPending}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition ${
                  isFollowing
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white"
                } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {getFollowButtonText()}
              </button>
            )}
          </div>
        </div>

        {isOwner && arc.isPrivate && pendingFollowers.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">
              Pending Requests ({pendingFollowers.length})
            </h3>
            <div className="space-y-3">
              {pendingFollowers.map(follower => (
                <div key={follower.userId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                      {follower.profileImage ? (
                        <img
                          src={follower.profileImage}
                          alt={follower.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-bold">
                          {follower.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-white font-semibold truncate">{follower.username}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveFollower(follower.userId)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs sm:text-sm font-semibold transition"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleRejectFollower(follower.userId)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs sm:text-sm font-semibold transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Updates</h2>

          {!canViewUpdates ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-2">This arc is private</h3>
              <p className="text-zinc-400 mb-6">Request to follow to see updates.</p>
            </div>
          ) : arc.updates.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">No updates yet</h3>
              <p className="text-zinc-400 mb-6">Start documenting your journey.</p>
              {isOwner && !arc.archived && (
                <button
                  onClick={() => setShowAddUpdate(true)}
                  className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Add First Update
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {arc.updates.slice().reverse().map((update) => (
                <div
                  key={update._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-zinc-700 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold border uppercase ${getUpdateColor(update.type)}`}>
                      {update.type}
                    </span>
                    <span className="text-zinc-500 text-xs sm:text-sm">
                      {getRelativeTime(update.createdAt)}
                    </span>
                  </div>

                  <p className="text-zinc-200 text-base sm:text-lg mb-4 whitespace-pre-wrap">
                    {truncateText(update.text, update._id)}
                  </p>

                  {update.text.length > 200 && (
                    <button
                      onClick={() => toggleExpanded(update._id)}
                      className="text-red-500 hover:text-red-400 text-sm font-semibold mb-4"
                    >
                      {expandedUpdates.has(update._id) ? "Show less" : "Read more"}
                    </button>
                  )}

                  {update.images && update.images.length > 0 && (
                    <div className={`grid gap-4 mb-4 ${update.images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {update.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-full aspect-video overflow-hidden rounded-lg border border-zinc-700 hover:border-red-500 transition cursor-pointer"
                          onClick={() => openLightbox(update.images, idx)}
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

                  <InteractionButtons
                    updateId={update._id}
                    isLiked={update.likes.includes(user?.id || "")}
                    onLike={(e) => handleLikeToggle(update._id, e)}
                    onReply={(e) => handleReplyClick(update._id, e)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddUpdate && (
        <AddArcUpdate
          arcId={arc._id}
          onClose={() => setShowAddUpdate(false)}
          onSuccess={() => {
            setShowAddUpdate(false);
            loadArc();
          }}
        />
      )}

      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxImages([])}
        />
      )}

      <CommentPanel
        isOpen={commentPanelOpen}
        comments={activeUpdate?.comments || []}
        onClose={() => setCommentPanelOpen(false)}
        onSubmit={handleCommentSubmit}
      />
    </div>
  );
}