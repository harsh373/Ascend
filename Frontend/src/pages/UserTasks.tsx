import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserTasks } from "../api/profileApi";

interface Task {
  _id: string;
  title: string;
  xp: number;
  proof: string;
  proofType: string;
  createdAt: string;
  status: string;
}

const UserTasks = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    getUserTasks(userId, page, 20)
      .then((res) => {
        if (page === 1) {
          setTasks(res.data.tasks);
        } else {
          setTasks((prev) => [...prev, ...res.data.tasks]);
        }
        setTotal(res.data.total);
        setTotalPages(res.data.pages);
      })
      .catch((err) => {
        console.error("Failed to fetch tasks:", err);
        if (err.response?.status === 403) {
          alert("This profile is private");
          navigate(`/profile/${userId}`);
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [userId, page, navigate]);

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
        Loading tasks...
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
            📋 Completed Tasks
          </h1>
          <p className="text-zinc-400">
            {total} task{total !== 1 ? "s" : ""} completed
          </p>
        </div>

        {/* TASKS LIST */}
        {tasks.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2">No Tasks Yet</h2>
            <p className="text-zinc-400">
              No completed tasks to display.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-zinc-700 transition"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{task.title}</h3>
                      <p className="text-zinc-400 text-sm">
                        Completed {timeAgo(task.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-red-500">
                        +{task.xp} XP
                      </p>
                    </div>
                  </div>

                  {/* PROOF */}
                  {task.proof && (
                    <div className="mt-4">
                      {task.proofType === "image" ? (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                          <img
                            src={task.proof}
                            alt="Task proof"
                            className="w-full max-h-96 object-contain"
                          />
                        </div>
                      ) : task.proofType === "link" ? (
                        <a
                          href={task.proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
                        >
                          🔗 {task.proof}
                        </a>
                      ) : (
                        <p className="text-zinc-300 text-sm bg-zinc-800 p-3 rounded border border-zinc-700">
                          {task.proof}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
                  Showing {tasks.length} of {total} tasks
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserTasks;