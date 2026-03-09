import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getPublicArc } from "../api/publicArcApi";
import SignupPromptModal from "../components/SignUpPromptModal";
import ImageLightbox from "../components/ImageLightbox";
import { getRelativeTime } from "../utils/dateUtils";
import { ThumbsUp, MessageCircle } from "lucide-react";

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
  status: string;
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

export default function PublicArcPage() {
  const { arcId } = useParams();
  const [arc, setArc] = useState<Arc | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [expandedUpdates, setExpandedUpdates] = useState<Set<string>>(new Set());
  const [showJoinBar, setShowJoinBar] = useState(false);
  const scrollCountRef = useRef(0);
  const hasShownBar = useRef(false);

  useEffect(() => {
    const loadArc = async () => {
      if (!arcId) return;
      try {
        setLoading(true);
        const res = await getPublicArc(arcId);
        setArc(res.data.data);
      } catch (error) {
        console.error("Error loading public arc:", error);
      } finally {
        setLoading(false);
      }
    };
    loadArc();
  }, [arcId]);

  useEffect(() => {
    if (!arc || arc.updates.length < 3) return;

    const handleScroll = () => {
      if (hasShownBar.current) return;

      const updates = document.querySelectorAll("[data-update-card]");
      let visibleCount = 0;

      updates.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          visibleCount++;
        }
      });

      if (visibleCount >= 3) {
        scrollCountRef.current++;
        if (scrollCountRef.current >= 1) {
          setShowJoinBar(true);
          hasShownBar.current = true;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [arc]);

  const handleInteraction = () => {
    setShowPrompt(true);
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const toggleExpanded = (updateId: string) => {
    setExpandedUpdates((prev) => {
      const next = new Set(prev);
      if (next.has(updateId)) {
        next.delete(updateId);
      } else {
        next.add(updateId);
      }
      return next;
    });
  };

  const truncateText = (text: string, updateId: string) => {
    const isExpanded = expandedUpdates.has(updateId);
    if (text.length <= 200 || isExpanded) return text;
    return text.substring(0, 200) + "...";
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case "progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "milestone": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "reflection": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getWhatsAppLink = () => {
    const arcLink = `https://3ascend.com/arc/public/${arcId}`;
    const message = `Hey, I just started a journey on Ascend and I want you to follow along. Check it out here: ${arcLink}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!arc) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Arc not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32">
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

        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-zinc-700/50 rounded-lg">
            <span className="text-red-500 font-black text-sm">3ascend</span>
          </div>
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
            <button
              onClick={handleInteraction}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition"
            >
              Follow
            </button>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition text-white flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Updates</h2>

          {arc.updates.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">No updates yet</h3>
              <p className="text-zinc-400">This journey is just getting started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {arc.updates.slice().reverse().map((update) => (
                <div
                  key={update._id}
                  data-update-card
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
                    <div className={`grid gap-4 mb-4 ${update.images.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
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

                  <div className="flex items-center gap-4 pt-2.5 pb-1">
                    <button onClick={handleInteraction}>
                      <ThumbsUp
                        size={20}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        strokeWidth={1.5}
                      />
                    </button>
                    <button
                      onClick={handleInteraction}
                      className="flex items-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors"
                    >
                      <MessageCircle size={20} strokeWidth={1.5} />
                      <span className="text-sm font-medium">Reply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showJoinBar && !showPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <p className="text-zinc-300 text-sm font-medium">
              Want to follow this journey?
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => setShowJoinBar(false)}
                className="px-4 py-2 text-zinc-500 hover:text-zinc-400 text-sm transition"
              >
                Dismiss
              </button>
              <button
                onClick={handleInteraction}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition"
              >
                Join Ascend
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrompt && arcId && (
        <SignupPromptModal
          arcId={arcId}
          onClose={() => setShowPrompt(false)}
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