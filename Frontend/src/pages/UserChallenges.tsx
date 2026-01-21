import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserChallenges } from "../api/profileApi";

const DEFAULT_AVATAR = "/assets/user.png";

interface Challenge {
  _id: string;
  challengerId: string;
  challengerName: string;
  challengerPhoto: string;
  opponentId: string;
  opponentName: string;
  opponentPhoto: string;
  title: string;
  xpReward: number;
  status: "approved" | "failed";
  proof: string;
  createdAt: string;
}

type FilterType = "all" | "won" | "lost";

const UserChallenges = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Stats for filter tabs
  const [wonCount, setWonCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    getUserChallenges(userId, page, 20, filter)
      .then((res) => {
        if (page === 1) {
          setChallenges(res.data.challenges);
        } else {
          setChallenges((prev) => [...prev, ...res.data.challenges]);
        }
        setTotal(res.data.total);
        setTotalPages(res.data.pages);

        // Calculate counts for tab display
        if (filter === "all") {
          const won = res.data.challenges.filter((c: Challenge) => c.status === "approved").length;
          const lost = res.data.challenges.filter((c: Challenge) => c.status === "failed").length;
          setWonCount(won);
          setLostCount(lost);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch challenges:", err);
        if (err.response?.status === 403) {
          alert("This profile is private");
          navigate(`/profile/${userId}`);
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [userId, page, filter, navigate]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1); // Reset to page 1 when filter changes
    setChallenges([]); // Clear current challenges
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setLoadingMore(true);
      setPage(page + 1);
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
    return `${Math.floor(seconds / 31536000)} years ago`;
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading challenges...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/profile/${userId}`)}
            className="text-zinc-400 hover:text-white mb-4 flex items-center gap-2 transition"
          >
            ← Back to Profile
          </button>

          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            ⚡ Challenges
          </h1>
          <p className="text-zinc-400">
            {total} challenge{total !== 1 ? "s" : ""} completed
          </p>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("won")}
            className={`px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              filter === "won"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Won {filter === "all" && wonCount > 0 ? `(${wonCount})` : ""}
          </button>
          <button
            onClick={() => handleFilterChange("lost")}
            className={`px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              filter === "lost"
                ? "bg-red-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Lost {filter === "all" && lostCount > 0 ? `(${lostCount})` : ""}
          </button>
        </div>

        {/* CHALLENGES LIST */}
        {challenges.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold mb-2">No Challenges Yet</h2>
            <p className="text-zinc-400">
              {filter === "all" 
                ? "No completed challenges to display."
                : filter === "won"
                ? "No won challenges yet."
                : "No lost challenges yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const isWon = challenge.status === "approved";
                const opponentPhoto = challenge.challengerId === userId 
                  ? challenge.opponentPhoto 
                  : challenge.challengerPhoto;
                const opponentName = challenge.challengerId === userId
                  ? challenge.opponentName
                  : challenge.challengerName;

                return (
                  <div
                    key={challenge._id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-zinc-700 transition"
                  >
                    {/* HEADER */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* OPPONENT PHOTO */}
                      <img
                        src={opponentPhoto || DEFAULT_AVATAR}
                        alt={opponentName}
                        className="w-12 h-12 rounded-full border-2 border-zinc-700 object-cover"
                      />

                      {/* INFO */}
                      <div className="flex-1">
                        <p className="text-zinc-400 text-sm mb-1">
                          vs {opponentName}
                        </p>
                        <h3 className="text-xl font-bold mb-1">
                          {challenge.title}
                        </h3>
                        <p className="text-zinc-400 text-sm">
                          Completed {timeAgo(challenge.createdAt)}
                        </p>
                      </div>

                      {/* STATUS & XP */}
                      <div className="text-right">
                        <div
                          className={`px-3 py-1 rounded-lg font-bold mb-2 ${
                            isWon
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {isWon ? "✅ Won" : "❌ Lost"}
                        </div>
                        <p className="text-lg font-black text-red-500">
                          {isWon ? "+" : ""}{challenge.xpReward} XP
                        </p>
                      </div>
                    </div>

                    {/* PROOF IMAGE */}
                    {challenge.proof && (
                      <div className="mt-4 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                        <img
                          src={challenge.proof}
                          alt="Challenge proof"
                          className="w-full max-h-56 object-contain"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LOAD MORE BUTTON */}
            {page < totalPages && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
                <p className="text-zinc-500 text-sm mt-3">
                  Showing {challenges.length} of {total} challenges
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserChallenges;