import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { getUserProfile } from "../api/userApi";
import { getUserArcs, getFollowedArcs, followArc, unfollowArc } from "../api/arcApi";
import { uploadAvatar } from "../api/uploadApi";
import FollowedArcsModal from "../components/FollowedArcsModel";
import LoadingSkeleton from "../components/LoadingSkelton";
import { getRelativeTime } from "../utils/dateUtils";
import { getErrorMessage } from "../utils/getErrorMessage";

interface UserProfile {
  clerkUserId: string;
  username: string;
  fullName?: string;
  profileImage: string;
}

interface Update {
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
  updates: Update[];
  followers: { userId: string }[];
  lastUpdatedAt: string;
}

export default function Profile() {
  const { userId } = useParams();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [followedArcs, setFollowedArcs] = useState<Arc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showFollowedModal, setShowFollowedModal] = useState(false);
  const [error, setError] = useState("");

  const isOwnProfile = !userId || userId === user?.id;
  const profileUserId = userId || user?.id;

  useEffect(() => {
    if (!isLoaded || !user || !profileUserId) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileRes, arcsRes, followedRes] = await Promise.all([
          getUserProfile(profileUserId),
          getUserArcs(profileUserId),
          getFollowedArcs(profileUserId)
        ]);

        setProfile(profileRes.data);
        setArcs(arcsRes.data.data);
        setFollowedArcs(followedRes.data.data);
      } catch (err: unknown){
        console.error("Error loading profile:", err);
         setError(getErrorMessage(err));
      
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoaded, user, userId, profileUserId]);

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;

    try {
      setUploading(true);
      const res = await uploadAvatar(file, user.id);
      setProfile(prev => prev ? { ...prev, profileImage: res.data.imageUrl } : null);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleFollowToggle = async (arcId: string) => {
    if (!user || !profileUserId) return;

    const arc = arcs.find(a => a._id === arcId);
    if (!arc) return;

    const isFollowing = arc.followers.some(f => f.userId === user.id);

    try {
      if (isFollowing) {
        await unfollowArc(arcId, user.id);
      } else {
        await followArc(arcId, user.id);
      }
      
      window.location.reload();
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        {error || "Profile not found"}
      </div>
    );
  }

  const displayName = profile.fullName || profile.username;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <div className="bg-zinc-900 lg:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-6">
          <div className="lg:max-w-3xl lg:mx-auto lg:bg-zinc-900 lg:border lg:border-zinc-800 lg:rounded-xl lg:p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-zinc-700 overflow-hidden">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-400">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <label className="absolute -bottom-1 -right-1 bg-red-600 hover:bg-red-500 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center shadow-lg transition">
                    {uploading ? (
                      <span className="text-xs">⏳</span>
                    ) : (
                      <span className="text-base">📷</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {displayName}
                </h1>
                {profile.fullName && profile.fullName !== profile.username && (
                  <p className="text-zinc-400 text-sm">@{profile.username}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 py-4 border-t border-zinc-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{arcs.length}</p>
                <p className="text-zinc-400 text-sm">Arcs</p>
              </div>
              
              <div className="h-8 w-px bg-zinc-800" />
              
              <div className="text-center">
                {followedArcs.length > 0 ? (
                  <button
                    onClick={() => setShowFollowedModal(true)}
                    className="hover:opacity-80 transition"
                  >
                    <p className="text-2xl font-bold text-white">{followedArcs.length}</p>
                    <p className="text-red-400 text-sm font-semibold">Following</p>
                  </button>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-white">{followedArcs.length}</p>
                    <p className="text-zinc-400 text-sm">Following</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="lg:max-w-3xl lg:mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            {isOwnProfile ? "My Arcs" : `${displayName}'s Arcs`}
          </h2>

          {arcs.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-2">No arcs yet</h3>
              <p className="text-zinc-400 mb-6">
                {isOwnProfile ? "Create your first arc to start your journey" : "This user hasn't created any arcs yet"}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate("/create-arc")}
                  className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Create Arc
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {arcs.map((arc) => {
                const isFollowing = arc.followers.some(f => f.userId === user?.id);

                return (
                  <div
                    key={arc._id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/arc/${arc._id}`)}
                  >
                    <div
                      className="h-40 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${arc.coverPhoto})` }}
                    >
                      <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-black text-white">
                          {arc.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold uppercase">
                          {arc.theme}
                        </span>
                        {arc.archived && (
                          <span className="px-3 py-1 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-lg text-xs font-semibold uppercase">
                            Archived
                          </span>
                        )}
                      </div>

                      <p className="text-zinc-400 text-sm mb-3">
                        {arc.updates.length} {arc.updates.length === 1 ? "update" : "updates"} • {getRelativeTime(arc.lastUpdatedAt)}
                      </p>

                      {!isOwnProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(arc._id);
                          }}
                          className={`w-full py-2 rounded-lg font-semibold transition ${
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showFollowedModal && (
        <FollowedArcsModal
          arcs={followedArcs}
          onClose={() => setShowFollowedModal(false)}
        />
      )}
    </div>
  );
}