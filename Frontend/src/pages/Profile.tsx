import { useUser, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserProfile, getUserFriends } from "../api/userApi";
import { uploadAvatar } from "../api/uploadApi";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=111827&color=fff";

const Profile = () => {
  const { userId } = useParams();
  const { user, isLoaded } = useUser();

  const [profile, setProfile] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const targetId = userId || user?.id;
    if (!targetId) return;

    getUserProfile(targetId).then(res => setProfile(res.data));
    getUserFriends(targetId).then(res => setFriends(res.data));
  }, [isLoaded, user?.id, userId]);

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;

    try {
      setUploading(true);

      const res = await uploadAvatar(file, user.id);

      setProfile((prev: any) => ({
        ...prev,
        profileImage: res.data.imageUrl,
      }));
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading profile...
      </div>
    );
  }

  const avatar =
    profile.profileImage ||
    user?.imageUrl ||
    `https://ui-avatars.com/api/?name=${profile.username}`;

  const isOwnProfile = user?.id === userId || !userId;
  const xpProgress = profile.xp % 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto">

        
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 mb-12">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

            {/* AVATAR */}
            <div className="relative">
              <img
                src={avatar}
                className="w-32 h-32 rounded-xl border-4 border-zinc-800 object-cover"
              />

              {isOwnProfile && (
                <label className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg cursor-pointer text-xs font-semibold">
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
              <div className="flex justify-between items-start gap-4">
                
                {/* Name + Rank */}
                <div>
                  <h1 className="text-3xl font-black mb-1">
                    {profile.fullName || profile.username}
                  </h1>
                  <p className="text-zinc-400 text-sm">
                    Rank {profile.rank || "D"} • {profile.xp} XP
                  </p>
                </div>

                {/* Mobile Clerk Avatar (Sign Out) */}
                <div className="block md:hidden">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      },
                    }}
                  />
                </div>

              </div>

              {/* XP BAR */}
              <div className="mt-6">
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

        {/* STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Stat label="Total XP" value={profile.xp} />
          <Stat label="Tasks" value={profile.stats.totalTasks} />
          <Stat label="Approved" value={profile.stats.heavyApproved} />
          <Stat label="Rejected" value={profile.stats.heavyRejected} />
        </section>

        {/* RECENT MISSIONS */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Missions</h2>
            <button
              onClick={() => window.location.href = "/tasks"}
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded font-semibold"
            >
              View All →
            </button>
          </div>

          {profile.recentTasks.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-400">
              No missions completed yet.
            </div>
          ) : (
            <div className="space-y-3">
              {profile.recentTasks.slice(0, 5).map((task: any, i: number) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-between items-center hover:border-red-500 transition"
                >
                  <div>
                    <p className="font-semibold text-lg">{task.title}</p>
                    <span className="text-red-400 text-sm">+{task.xp} XP</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      task.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : task.status === "rejected"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FRIENDS MODAL */}
        {showFriends && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">

              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold">Friends</h3>
                <button onClick={() => setShowFriends(false)}>✕</button>
              </div>

              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                {friends.map((f) => (
                  <div
                    key={f.clerkUserId}
                    className="flex justify-between items-center bg-black p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={f.profileImage || DEFAULT_AVATAR}
                        className="w-10 h-10 rounded-full"
                      />
                      <p>{f.fullName || f.username}</p>
                    </div>

                    <Link
                      to={`/profile/${f.clerkUserId}`}
                      onClick={() => setShowFriends(false)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm font-semibold"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-zinc-800">
                <button
                  onClick={() => setShowFriends(false)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const Stat = ({ label, value }: any) => (
  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-red-500 transition">
    <p className="text-zinc-400 text-xs uppercase">{label}</p>
    <p className="text-4xl font-black text-red-500">{value}</p>
  </div>
);

export default Profile;
