import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { getArcById, followArc, unfollowArc, archiveArc, unarchiveArc } from "../api/arcApi";
import AddArcUpdate from "../components/AddArcUpdate";
import ImageLightbox from "../components/ImageLightbox";
import LoadingSkeleton from "../components/LoadingSkelton";
import { getRelativeTime } from "../utils/dateUtils";

interface ArcUpdate {
  _id: string;
  type: string;
  text: string;
  images: string[];
  createdAt: string;
}

interface Arc {
  _id: string;
  userId: string;
  title: string;
  theme: string;
  coverPhoto: string;
  archived: boolean;
  updates: ArcUpdate[];
  followers: { userId: string; createdAt: string }[];
  lastUpdatedAt: string;
  createdAt: string;
}

export default function ArcPage() {
  const { arcId } = useParams();
  const { user } = useUser();

  const [arc, setArc] = useState<Arc | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [expandedUpdates, setExpandedUpdates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadArc = async () => {
      if (!arcId) return;
      try {
        setLoading(true);
        const res = await getArcById(arcId);
        setArc(res.data.data);
      } catch (error) {
        console.error("Error loading arc:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArc();
  }, [arcId]);

  const loadArc = async () => {
    if (!arcId) return;
    try {
      setLoading(true);
      const res = await getArcById(arcId);
      setArc(res.data.data);
    } catch (error) {
      console.error("Error loading arc:", error);
    } finally {
      setLoading(false);
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

  const isFollowing = arc.followers.some(f => f.userId === user?.id) || false;
  const isOwner = arc.userId === user?.id;

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
          
          {arc.archived && (
            <span className="px-3 py-1 bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 rounded-lg text-xs sm:text-sm font-semibold uppercase">
              Archived
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black text-white drop-shadow-lg">
              {arc.title}
            </h1>
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
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition ${
                  isFollowing
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Updates</h2>

          {arc.updates.length === 0 ? (
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
                    <div className={`grid gap-4 ${update.images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {update.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Update image ${idx + 1}`}
                          onClick={() => openLightbox(update.images, idx)}
                          className="w-full rounded-lg border border-zinc-700 cursor-pointer hover:border-red-500 transition"
                        />
                      ))}
                    </div>
                  )}
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
    </div>
  );
}