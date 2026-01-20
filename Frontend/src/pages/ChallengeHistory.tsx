import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getChallenges } from "../api/challengeApi";
import ChallengeCard from "../components/ChallengeCard";

type Challenge = {
  _id: string;
  challengerId: string;
  opponentId: string;
  challengerName: string;
  challengerPhoto: string;
  opponentName: string;
  opponentPhoto: string;
  title: string;
  xpReward: number;
  status: "pending" | "accepted" | "submitted" | "approved" | "failed" | "rejected";
  requiresProof: boolean;
  proof?: string;
  createdAt: string;
  expiresAt: string;
};

type FilterType = "all" | "won" | "lost";
type SortType = "recent" | "oldest";

export default function ChallengeHistory() {
  const { user } = useUser();
  const userId = user?.id;
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("recent");

  useEffect(() => {
    if (!userId) return;

    getChallenges(userId)
      .then(res => setChallenges(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Please sign in.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading history...
      </div>
    );
  }

  // Get all completed challenges
  let completed = challenges.filter(ch => ["approved", "failed"].includes(ch.status));

  // Apply filter
  if (filter === "won") {
    completed = completed.filter(ch => ch.status === "approved");
  } else if (filter === "lost") {
    completed = completed.filter(ch => ch.status === "failed");
  }

  // Apply sort
  if (sort === "recent") {
    completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    completed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Calculate stats
  const totalCompleted = challenges.filter(ch => ["approved", "failed"].includes(ch.status)).length;
  const totalWon = challenges.filter(ch => ch.status === "approved").length;
  const totalLost = challenges.filter(ch => ch.status === "failed").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/challenges")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm sm:text-base"
        >
          <span>←</span>
          <span>Back to Challenges</span>
        </button>

        {/* HEADER */}
        <section>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-red-500">
            Challenge History
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-1">
            All your completed challenges
          </p>
        </section>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">{totalCompleted}</p>
            <p className="text-xs sm:text-sm text-zinc-500">Total</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{totalWon}</p>
            <p className="text-xs sm:text-sm text-zinc-500">Won</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-red-400">{totalLost}</p>
            <p className="text-xs sm:text-sm text-zinc-500">Lost</p>
          </div>
        </div>

        {/* FILTERS & SORT */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition text-sm ${
                filter === "all"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("won")}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition text-sm ${
                filter === "won"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Won ✓
            </button>
            <button
              onClick={() => setFilter("lost")}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition text-sm ${
                filter === "lost"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Lost ✗
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-sm text-white focus:outline-none focus:border-red-500"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* CHALLENGES LIST */}
        <div className="space-y-3 sm:space-y-4">
          {completed.length ? (
            completed.map(ch => (
              <ChallengeCard key={ch._id} challenge={ch} viewMode="completed" />
            ))
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-zinc-500 italic">
                {filter === "won"
                  ? "No won challenges yet"
                  : filter === "lost"
                  ? "No lost challenges yet"
                  : "No completed challenges yet"}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}