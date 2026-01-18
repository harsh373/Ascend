import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getUserTasks, completeTask } from "../api/taskApi";

export default function AllTasks() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    loadTasks();
  }, [isLoaded, userId]);

  const loadTasks = async () => {
    const res = await getUserTasks(userId!);
    setTasks(res.data.reverse()); // latest first
    setLoading(false);
  };

  const handleComplete = async (taskId: string) => {
    await completeTask(taskId);
    loadTasks();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <section className="mb-10">
          <h1 className="text-4xl font-black text-red-500">ALL MISSIONS</h1>
          <p className="text-zinc-400">Every task you’ve created.</p>
        </section>

        {/* TASKS */}
        {tasks.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-400">
            No tasks yet.
          </div>
        )}

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{task.title}</p>

                <div className="flex gap-3 mt-2 text-sm">
                  <span className="text-red-400">+{task.xp} XP</span>

                  <span className="text-zinc-400">
                    {task.status}
                  </span>
                </div>
              </div>

              {task.status === "pending" && (
                <button
                  onClick={() => handleComplete(task._id)}
                  className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-semibold"
                >
                  Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
