import { useUser, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPublicProfile, togglePrivacy } from "../api/profileApi";
import { getUserFriends } from "../api/userApi"; 
import { uploadAvatar } from "../api/uploadApi";
import { sendRequest } from "../api/friendApi";

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
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const targetId = userId || user?.id;
    if (!targetId) return;

    getPublicProfile(targetId)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Failed to fetch profile:", err));

    getUserFriends(targetId)
      .then((res) => setFriends(res.data))
      .catch((err) => console.error("Failed to fetch friends:", err));
  }, [isLoaded, user?.id, userId]);

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;
    try {
      setUploading(true);
      const res = await uploadAvatar(file, user.id);
      setProfile((prev) => prev ? { ...prev, profileImage: res.data.imageUrl } : null);
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
      setProfile((prev) => prev ? { ...prev, isPublic: res.data.isPublic } : null);
    } catch (err) {
      console.error("Failed to toggle privacy:", err);
    } finally {
      setTogglingPrivacy(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user?.id || !profile?.clerkUserId) return;
    try {
      setSendingRequest(true);
      await sendRequest(user.id, profile.clerkUserId);
      alert(`Friend request sent!`);
      const res = await getPublicProfile(profile.clerkUserId);
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to send friend request:", err);
      alert("Failed to send friend request.");
    } finally {
      setSendingRequest(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  const avatar = profile.profileImage || DEFAULT_AVATAR;
  const isOwnProfile = profile.isOwnProfile || (!userId && user?.id === profile.clerkUserId) || (user?.id === profile.clerkUserId);
  const xpProgress = profile.xp % 100;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* HEADER */}
      <div className="bg-zinc-900 lg:bg-zinc-950 pb-6">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="lg:max-w-3xl lg:mx-auto lg:bg-zinc-900 lg:border lg:border-zinc-800 lg:rounded-xl lg:p-6">
            {/* TOP ROW - Avatar and Name */}
            <div className="flex items-center gap-4 mb-4">
            {/* AVATAR */}
            <div className="relative">
              <img
                src={avatar}
                alt={profile.fullName}
                className="w-20 h-20 rounded-full border-2 border-zinc-700 object-cover"
              />
              {isOwnProfile && (
                <label className="absolute -bottom-1 -right-1 bg-red-600 hover:bg-red-500 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center shadow-lg transition">
                  {uploading ? "⏳" : "📷"}
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])} />
                </label>
              )}
            </div>

            {/* NAME & LEVEL */}
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">{profile.fullName || profile.username}</h1>
              <div className="flex items-center gap-2 mt-1 text-zinc-400 text-sm">
                <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs">Level {profile.level}</span>
                <span className="text-xs">{profile.xp.toLocaleString()} XP</span>
              </div>
            </div>

            {/* USER BUTTON (only for own profile) */}
            {isOwnProfile && <UserButton />}
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{profile.stats?.totalXp.toLocaleString() || 0}</div>
              <div className="text-xs text-zinc-400">XP</div>
            </div>
            <div 
              className="text-center cursor-pointer"
              onClick={() => setShowFriends(true)}
            >
              <div className="text-xl font-bold text-white">{profile.friendsCount}</div>
              <div className="text-xs text-zinc-400">Friends</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{profile.longestStreak}</div>
              <div className="text-xs text-zinc-400">Best Streak</div>
            </div>
          </div>

          {/* ACTION BUTTONS - Below everything */}
          {isOwnProfile ? (
            <button
              onClick={handleTogglePrivacy}
              disabled={togglingPrivacy}
              className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition text-white"
            >
              {profile.isPublic ? "🌐 Public Profile" : "🔒 Private Profile"}
            </button>
          ) : (
            profile.canViewDetails && (
              <div className="grid grid-cols-2 gap-3">
                {profile.isFriend ? (
                  <div className="px-4 py-2.5 bg-emerald-600 rounded-lg text-sm font-semibold text-center">
                    ✅ Friends
                  </div>
                ) : (
                  <button
                    onClick={handleSendFriendRequest}
                    disabled={sendingRequest}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                  >
                    {sendingRequest ? "Requested" : "Add Friend"}
                  </button>
                )}
                <button
                  onClick={() => setShowChallengeModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition"
                >
                  Challenge
                </button>
              </div>
            )
          )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="lg:max-w-3xl lg:mx-auto">
        {!profile.canViewDetails ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-2">This profile is private</h2>
            <p className="text-zinc-400">Add them as a friend to see their profile</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* PROGRESS BAR */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Level {profile.level} Progress</span>
                <span className="text-zinc-400">{xpProgress}/100 XP</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 transition-all" style={{ width: `${xpProgress}%` }} />
              </div>
              {profile.currentStreak > 0 && (
                <div className="text-center mt-3 text-red-400 font-medium text-sm">
                  🔥 {profile.currentStreak} day streak
                </div>
              )}
            </div>

            {/* HABITS */}
            {profile.habits && profile.habits.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h2 className="text-sm text-zinc-400 mb-3">Active Habits</h2>
                <div className="space-y-2">
                  {profile.habits.slice(0, 6).map((habit, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                      <span className="text-sm font-medium text-white">{habit.title}</span>
                      <span className="text-red-500 font-bold text-sm">{habit.streak}🔥</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TASKS */}
            <button
              onClick={() => navigate(`/profile/${profile.clerkUserId}/tasks`)}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 text-left transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Completed Tasks</div>
                  <div className="text-2xl font-bold text-red-500">{profile.stats?.completedTasks || 0}</div>
                </div>
                <div className="text-2xl">📋</div>
              </div>
            </button>

            {/* CHALLENGES */}
            <button
              onClick={() => navigate(`/profile/${profile.clerkUserId}/challenges`)}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 text-left transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Challenge Record</div>
                  <div className="text-xl font-bold text-red-500">
                    {profile.stats?.wonChallenges}W - {profile.stats?.lostChallenges}L
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Win Rate: {profile.stats?.winRate}%
                  </div>
                </div>
                <div className="text-2xl">⚡</div>
              </div>
            </button>
          </div>
        )}
        </div>
      </div>

      {/* FRIENDS MODAL */}
      {showFriends && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold text-white">Friends ({friends.length})</h3>
              <button onClick={() => setShowFriends(false)} className="text-zinc-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">No friends yet</p>
              ) : (
                friends.map((f) => (
                  <div key={f.clerkUserId} className="flex justify-between items-center p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={f.profileImage || DEFAULT_AVATAR} alt={f.fullName} className="w-10 h-10 rounded-full object-cover" />
                      <span className="font-medium text-sm text-white">{f.fullName || f.username}</span>
                    </div>
                    <Link
                      to={`/profile/${f.clerkUserId}`}
                      onClick={() => setShowFriends(false)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded text-xs font-semibold transition"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
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
  );
};

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
      const { createChallenge } = await import("../api/challengeApi");
      await createChallenge({
        challengerId: user.id,
        opponentId,
        title: title.trim(),
        xpReward,
        requiresProof,
        hours,
      });
      alert(`Challenge sent!`);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to send challenge.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-semibold text-white">Challenge {opponentName}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-400">Challenge</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Do 100 pushups"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-400">XP Reward: {xpReward}</label>
            <input type="range" min="1" max="50" value={xpReward} onChange={(e) => setXpReward(parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>1 XP</span>
              <span>50 XP</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-400">Time Limit: {hours}h</label>
            <input type="range" min="1" max="168" value={hours} onChange={(e) => setHours(parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>1h</span>
              <span>168h</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg p-3">
            <input type="checkbox" id="proof" checked={requiresProof} onChange={(e) => setRequiresProof(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="proof" className="text-sm cursor-pointer text-white">Require photo proof</label>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-lg font-semibold transition text-white">Cancel</button>
          <button onClick={handleSend} disabled={!title.trim() || sending} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg font-semibold transition disabled:opacity-50 text-white">
            {sending ? "Sending..." : "Send Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;