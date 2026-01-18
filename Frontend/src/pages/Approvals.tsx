import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { voteOnTask } from "../api/approvalApi";
import api from "../api/axios";

export default function Approvals() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="bg-black text-white p-10">
        Loading...
      </div>
    );
  }

  const userId = user?.id;

  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      const res = await api.get(`/tasks/review/${userId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load review tasks", err);
    }
  };

  const vote = async (taskId: string, decision: "approve" | "reject") => {
    if (!userId) {
      alert("User not loaded");
      return;
    }

    try {
      await voteOnTask({
        taskId,
        userId,
        vote: decision,
      });

      loadTasks();
    } catch (err) {
      console.error("Vote failed", err);
      alert("Vote failed. Check backend logs.");
    }
  };

  return (
    <div className="bg-black text-white w-full px-6 py-12">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-red-500 mb-8">
          Review Tasks
        </h1>

        {tasks.length === 0 && (
          <p className="text-gray-500">
            No tasks to review right now.
          </p>
        )}

        <div className="space-y-6">
          {tasks.map((t) => (
            <div
              key={t._id}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800"
            >
              <h2 className="text-xl font-semibold mb-2">
                {t.title}
              </h2>

              <p className="text-gray-400 text-sm mb-4">
                Proof: {t.proof}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => vote(t._id, "approve")}
                  className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold"
                >
                  Approve (+5 XP)
                </button>

                <button
                  onClick={() => vote(t._id, "reject")}
                  className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
