import { useUser, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPublicProfile, togglePrivacy } from "../api/profileApi";
import { getUserFriends } from "../api/userApi"; // Keep this for friends list
import { uploadAvatar } from "../api/uploadApi";

const DEFAULT_AVATAR = "/assets/user.png";

interface ProfileData {
  clerkUserId: string;
  username: string;
  fullName: string;
  profileImage: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  friendsCount: number;
  isPublic: boolean;
  isOwnProfile: boolean;
  isFriend: boolean;
  canViewDetails: boolean;
  stats?: {
    totalXp: number;
    wonChallenges: number;
    lostChallenges: number;
    winRate: number;
    completedTasks: number;
  };
  habits?: Array<{
    title: string;
    streak: number;
  }>;
  message?: string;
}

const Profile = () => {
  const { userId } = useParams();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const targetId = userId || user?.id;
    if (!targetId) return;

    // Fetch profile data
    getPublicProfile(targetId)
      .then((res) => {
        console.log("🔍 Profile API Response:", res.data);
        console.log("  - isFriend:", res.data.isFriend);
        console.log("  - isOwnProfile:", res.data.isOwnProfile);
        console.log("  - Current user ID:", user?.id);
        console.log("  - Target user ID:", targetId);
        setProfile(res.data);
      })
      .catch((err) => console.error("Failed to fetch profile:", err));

    // Fetch friends list
    getUserFriends(targetId)
      .then((res) => setFriends(res.data))
      .catch((err) => console.error("Failed to fetch friends:", err));
  }, [isLoaded, user?.id, userId]);

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;

    try {
      setUploading(true);
      const res = await uploadAvatar(file, user.id);
      setProfile((prev) => 
        prev ? { ...prev, profileImage: res.data.imageUrl } : null
      );
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      setTogglingPrivacy(true);
      const res = await togglePrivacy();
      setProfile((prev) => 
        prev ? { ...prev, isPublic: res.data.isPublic } : null
      );
    } catch (err) {
      console.error("Failed to toggle privacy:", err);
    } finally {
      setTogglingPrivacy(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading profile...
      </div>
    );
  }

  const avatar = profile.profileImage || DEFAULT_AVATAR;
  
  // FIXED: Better own profile detection
  const isOwnProfile = 
    profile.isOwnProfile || 
    (!userId && user?.id === profile.clerkUserId) ||
    (user?.id === profile.clerkUserId);
  
  const xpProgress = profile.xp % 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        
        {/* PROFILE HEADER */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            
            {/* AVATAR */}
            <div className="relative">
              <img
                src={avatar}
                alt={profile.fullName}
                className="w-32 h-32 rounded-xl border-4 border-zinc-800 object-cover"
              />

              {isOwnProfile && (
                <label className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg cursor-pointer text-xs font-semibold transition">
                  {uploading ? "Uploading..." : "Edit"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      e.target.files && handleAvatarUpload(e.target.files[0])
                    }
                  />
                </label>
              )}

              <div className="absolute -top-3 -right-3 w-12 h-12 bg-red-600 rounded-full flex flex-col items-center justify-center text-sm font-bold border-4 border-zinc-900">
                <span className="text-xs">LVL</span>
                {profile.level}
              </div>
            </div>

            {/* INFO */}
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start gap-4 mb-4">
                
                {/* Name + Streak */}
                <div>
                  <h1 className="text-3xl font-black mb-1">
                    {profile.fullName || profile.username}
                  </h1>
                  <p className="text-zinc-400 text-sm mb-2">
                    {profile.xp} XP
                  </p>
                  {profile.canViewDetails && (
                    <p className="text-red-400 text-lg font-bold">
                      🔥 {profile.currentStreak} day streak
                    </p>
                  )}
                </div>

                {/* Privacy Toggle & UserButton */}
                <div className="flex items-center gap-3">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={handleTogglePrivacy}
                        disabled={togglingPrivacy}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                      >
                        {profile.isPublic ? "🌐 Public" : "🔒 Private"}
                      </button>
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10",
                          },
                        }}
                      />
                    </>
                  ) : (
                    <div className="w-10 h-10" /> 
                  )}
                </div>
              </div>

              {/* XP BAR */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Level Progress</span>
                  <span className="text-red-400 font-semibold">
                    {xpProgress}%
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRIVATE PROFILE MESSAGE */}
        {!profile.canViewDetails && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-12 text-center mb-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">This Profile is Private</h2>
            <p className="text-zinc-400">
              {profile.isFriend 
                ? "You're friends but this profile is set to private" 
                : "Add this user as a friend to view their profile"}
            </p>
          </div>
        )}

        {/* STATS GRID (only if can view details) */}
        {profile.canViewDetails && profile.stats && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Stat label="Total XP" value={profile.stats.totalXp} />
            <Stat label="Best Streak" value={`${profile.longestStreak} days`} />
            <Stat 
              label="Friends" 
              value={profile.friendsCount} 
              onClick={() => setShowFriends(true)}
              clickable
            />
            <Stat label="Win Rate" value={`${profile.stats.winRate}%`} />
          </section>
        )}

        {/* CURRENT HABITS (only if can view details) */}
        {profile.canViewDetails && profile.habits && profile.habits.length > 0 && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">✅ Current Habits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.habits.slice(0, 6).map((habit, i) => (
                <div 
                  key={i} 
                  className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
                >
                  <p className="font-semibold text-lg mb-1">{habit.title}</p>
                  <p className="text-zinc-400 text-sm">
                    {habit.streak} day streak
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACTION BUTTONS (only if can view details) */}
        {profile.canViewDetails && profile.stats && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            
            {/* TASKS BUTTON */}
            <button
              onClick={() => navigate(`/profile/${profile.clerkUserId}/tasks`)}
              className="bg-zinc-900 border border-zinc-800 hover:border-red-500 rounded-xl p-6 text-left transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">📋 Completed Tasks</h3>
                <span className="text-zinc-500 group-hover:text-red-400 transition">→</span>
              </div>
              <p className="text-3xl font-black text-red-500">
                {profile.stats.completedTasks}
              </p>
              <p className="text-zinc-400 text-sm mt-2">View all tasks</p>
            </button>

            {/* CHALLENGES BUTTON */}
            <button
              onClick={() => navigate(`/profile/${profile.clerkUserId}/challenges`)}
              className="bg-zinc-900 border border-zinc-800 hover:border-red-500 rounded-xl p-6 text-left transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">⚡ Challenges</h3>
                <span className="text-zinc-500 group-hover:text-red-400 transition">→</span>
              </div>
              <p className="text-2xl font-black text-red-500 mb-1">
                {profile.stats.wonChallenges} Wins • {profile.stats.lostChallenges} Losses
              </p>
              <p className="text-zinc-400 text-sm">
                Win Rate: {profile.stats.winRate}%
              </p>
            </button>
          </section>
        )}

        {/* FRIEND ACTION BUTTONS (if viewing someone else's profile) */}
        {!isOwnProfile && profile.canViewDetails && (() => {
          // Debug logging
          console.log("🔍 Friend Button Logic:");
          console.log("  - profile.isFriend:", profile.isFriend);
          console.log("  - Showing:", profile.isFriend ? "Friends Badge" : "Add Friend Button");
          
          return (
            <section className="flex gap-4">
              {profile.isFriend ? (
                <div className="flex-1 bg-emerald-600 px-6 py-3 rounded-lg font-bold text-center flex items-center justify-center gap-2">
                  ✅ Friends
                </div>
              ) : (
                <button className="flex-1 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-bold transition">
                  🤝 Add Friend
                </button>
              )}
              <button 
                onClick={() => setShowChallengeModal(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold transition"
              >
                ⚡ Send Challenge
              </button>
            </section>
          );
        })()}

        {/* FRIENDS MODAL */}
        {showFriends && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold">Friends ({friends.length})</h3>
                <button 
                  onClick={() => setShowFriends(false)}
                  className="text-zinc-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                {friends.length === 0 ? (
                  <p className="text-center text-zinc-400 py-8">No friends yet</p>
                ) : (
                  friends.map((f) => (
                    <div
                      key={f.clerkUserId}
                      className="flex justify-between items-center bg-zinc-800 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={f.profileImage || DEFAULT_AVATAR}
                          alt={f.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <p className="font-semibold">{f.fullName || f.username}</p>
                      </div>

                      <Link
                        to={`/profile/${f.clerkUserId}`}
                        onClick={() => setShowFriends(false)}
                        className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm font-semibold transition"
                      >
                        View
                      </Link>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-zinc-800">
                <button
                  onClick={() => setShowFriends(false)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHALLENGE MODAL */}
        {showChallengeModal && (
          <ChallengeModal
            opponentId={profile.clerkUserId}
            opponentName={profile.fullName || profile.username}
            onClose={() => setShowChallengeModal(false)}
          />
        )}
      </div>
    </div>
  );
};

interface StatProps {
  label: string;
  value: string | number;
  onClick?: () => void;
  clickable?: boolean;
}

const Stat = ({ label, value, onClick, clickable }: StatProps) => (
  <div
    onClick={onClick}
    className={`bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-red-500 transition ${
      clickable ? "cursor-pointer" : ""
    }`}
  >
    <p className="text-zinc-400 text-xs uppercase mb-2">{label}</p>
    <p className="text-4xl font-black text-red-500">{value}</p>
  </div>
);

// Challenge Modal Component
interface ChallengeModalProps {
  opponentId: string;
  opponentName: string;
  onClose: () => void;
}

const ChallengeModal = ({ opponentId, opponentName, onClose }: ChallengeModalProps) => {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [xpReward, setXpReward] = useState(25);
  const [hours, setHours] = useState(24);
  const [requiresProof, setRequiresProof] = useState(true);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!user?.id || !title.trim()) return;

    try {
      setSending(true);
      
      // Import createChallenge from your challengeApi
      const { createChallenge } = await import("../api/challengeApi");
      
      await createChallenge({
        challengerId: user.id,
        opponentId,
        title: title.trim(),
        xpReward,
        requiresProof,
        hours,
      });

      alert(`Challenge sent to ${opponentName}! 🎯`);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to send challenge:", err);
      alert("Failed to send challenge. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg">
        {/* HEADER */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-xl font-bold">⚡ Challenge {opponentName}</h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="p-6 space-y-4">
          {/* Challenge Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Challenge Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Do 100 pushups in one day"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
              maxLength={100}
            />
          </div>

          {/* XP Reward */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              XP Reward: {xpReward} XP
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={xpReward}
              onChange={(e) => setXpReward(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>1 XP</span>
              <span>50 XP</span>
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Time Limit: {hours} hours
            </label>
            <input
              type="range"
              min="1"
              max="168"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>1h</span>
              <span>7 days</span>
            </div>
          </div>

          {/* Requires Proof */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requiresProof"
              checked={requiresProof}
              onChange={(e) => setRequiresProof(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="requiresProof" className="text-sm font-semibold cursor-pointer">
              Require photo proof
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!title.trim() || sending}
            className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;