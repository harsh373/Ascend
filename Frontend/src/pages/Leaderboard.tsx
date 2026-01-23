import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getFriendsLeaderboard } from "../api/leaderboardApi";

const DEFAULT_AVATAR = "/assets/user.png";

export default function Leaderboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const userId = user?.id;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      if (!userId) return;
      const res = await getFriendsLeaderboard(userId);
      setData(res.data);

      setLoading(false);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
      <div className="max-w-4xl mx-auto">

        <section className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-red-500 mb-2">
            Leaderboard
          </h1>
          <p className="text-zinc-400">
            Compete with friends you trust. Real progress, real accountability.
          </p>
        </section>

        {loading && (
          <p className="text-center text-zinc-400 py-10">Loading...</p>
        )}

        {!loading && data.length === 0 && (
          <div className="text-center py-10">
            <p className="text-zinc-500 mb-4">No friends added yet.</p>
            <p className="text-zinc-600 text-sm">
              Add friends to see how you rank against them!
            </p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="space-y-2">
            {data.map((u, i) => {
              const isYou = u.clerkUserId === userId;

              return (
                <div
                  key={u.clerkUserId}
                  onClick={() => navigate(`/profile/${u.clerkUserId}`)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer group transition ${
                    isYou
                      ? "border-red-500 bg-zinc-900 hover:border-red-400"
                      : "border-zinc-800 bg-zinc-900 hover:border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-zinc-400 font-bold">
                      #{i + 1}
                    </span>

                    <img
                      src={u.profileImage || DEFAULT_AVATAR}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700 group-hover:border-red-500 transition"
                    />

                    <div>
                      <p className="font-semibold group-hover:text-red-400 transition">
                        {u.fullName || u.username}
                        {isYou && (
                          <span className="ml-2 text-xs text-red-400">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Level {u.level}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-red-500 text-lg">
                      {u.xp}
                    </p>
                    <p className="text-xs text-zinc-500">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}