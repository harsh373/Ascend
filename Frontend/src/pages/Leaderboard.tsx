import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  getGlobalLeaderboard,
  getFriendsLeaderboard,
} from "../api/leaderboardApi";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=111827&color=fff";

export default function Leaderboard() {
  const { user } = useUser();
  const userId = user?.id;

  const [tab, setTab] = useState<"friends" | "global">("friends");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [tab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      if (tab === "friends") {
        if (!userId) return;
        const res = await getFriendsLeaderboard(userId);
        setData(res.data);
      } else {
        const res = await getGlobalLeaderboard();
        setData(res.data);
      }

      setLoading(false);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <section className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-red-500 mb-2">
            Leaderboard
          </h1>
          <p className="text-zinc-400">
            Track your rank. Beat your friends.
          </p>
        </section>

        {/* TABS */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab("friends")}
            className={`px-5 py-2 rounded-lg font-semibold border ${
              tab === "friends"
                ? "bg-red-600 border-red-500"
                : "bg-zinc-900 border-zinc-800 hover:border-red-500"
            }`}
          >
            Friends
          </button>

          <button
            onClick={() => setTab("global")}
            className={`px-5 py-2 rounded-lg font-semibold border ${
              tab === "global"
                ? "bg-red-600 border-red-500"
                : "bg-zinc-900 border-zinc-800 hover:border-red-500"
            }`}
          >
            Global
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-zinc-400 py-10">Loading...</p>
        )}

        {/* EMPTY */}
        {!loading && data.length === 0 && (
          <p className="text-center text-zinc-500 py-10">
            No rankings available.
          </p>
        )}

        {/* LIST */}
        {!loading && data.length > 0 && (
          <div className="space-y-2">
            {data.map((u, i) => {
              const isYou = u.clerkUserId === userId;

              return (
                <div
                  key={u.clerkUserId}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                    isYou
                      ? "border-red-500 bg-zinc-900"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-zinc-400 font-bold">
                      #{i + 1}
                    </span>

                    <img
                      src={u.profileImage || DEFAULT_AVATAR}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />

                    <div>
                      <p className="font-semibold">
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
