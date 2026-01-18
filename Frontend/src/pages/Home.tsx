
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { createUser } from "../api/userApi";
import { createTask, getUserTasks, completeTask } from "../api/taskApi";
import { getHabits, completeHabit } from "../api/habitApi";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const userId = user?.id;

  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [xpData, setXpData] = useState<{ xp: number; level: number }>({
    xp: 0,
    level: 1,
  });

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
     createUser(
  user.id,
  user.username || user.firstName || "User",
  fullName || "Anonymous User",
  user.imageUrl || ""
);

    loadTasks();
    loadHabits();
  }, [isLoaded, user]);

  const loadTasks = async () => {
    if (!userId) return;
    const res = await getUserTasks(userId);
    const latest = res.data.reverse().slice(0, 5);
    setTasks(latest);
  };

  const loadHabits = async () => {
    if (!userId) return;
    const res = await getHabits(userId);
    setHabits(res.data);
  };

  const handleCreateTask = async () => {
    if (!title || !userId) return;
    await createTask({ userId, title }); // XP fixed to 10
    setTitle("");
    loadTasks();
  };

  const handleCompleteTask = async (taskId: string) => {
    const res = await completeTask(taskId);

    setXpData({
      xp: res.data.user.xp,
      level: res.data.user.level,
    });

    loadTasks();
  };

  const handleCompleteHabit = async (habitId: string) => {
    await completeHabit(habitId);
    loadHabits();
  };

  const isCompletedToday = (date: string) => {
    if (!date) return false;
    return new Date(date).toDateString() === new Date().toDateString();
  };

  const streakColor = (streak: number) => {
    if (streak >= 7) return "text-red-500";
    if (streak >= 3) return "text-yellow-400";
    return "text-zinc-400";
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">

      {/* HERO */}
      <section className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            Daily Discipline
          </span>
          <h1 className="text-6xl sm:text-7xl font-black text-red-500 mt-2">
            ASCEND
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl">
            You either execute today or fall behind.
          </p>
        </div>

        <div className="w-36 h-36 rounded-full border-4 border-red-500 flex flex-col items-center justify-center">
          <p className="text-zinc-400 text-sm">LEVEL</p>
          <p className="text-5xl font-black text-red-500">{xpData.level}</p>
        </div>
      </section>

      {/* HABITS */}
      <section className="max-w-7xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-4">Today's Habits</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((h) => {
            const done = isCompletedToday(h.lastCompleted);

            return (
              <div
                key={h._id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-between items-center hover:border-red-500 transition"
              >
                <div>
                  <p className="font-semibold text-lg">{h.title}</p>
                  <p className={`text-sm ${streakColor(h.streak)}`}>
                    🔥 Streak: {h.streak} days
                  </p>
                </div>

                <button
                  disabled={done}
                  onClick={() => handleCompleteHabit(h._id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    done
                      ? "bg-emerald-700 text-white cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  {done ? "DONE ✔" : "DONE"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW TASK */}
      <section className="max-w-7xl mx-auto bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-12">
        <h2 className="text-2xl font-bold mb-2">New Mission</h2>
        <p className="text-zinc-400 mb-6">Extra objectives for XP.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white"
            placeholder="Enter your mission..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button
            onClick={handleCreateTask}
            className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold"
          >
            Add
          </button>
        </div>
      </section>

      {/* TASK LIST */}
      <section className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Missions</h2>

          <button
            onClick={() => navigate("/tasks")}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            View All →
          </button>
        </div>

        {tasks.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-400">
            No missions yet.
          </div>
        )}

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-between items-center hover:border-red-500 transition"
            >
              <div>
                <p className="font-semibold text-lg">{task.title}</p>

                <div className="flex gap-3 mt-2 text-sm">
                  <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded">
                    +10 XP
                  </span>

                  <span className="px-2 py-1 bg-zinc-700 text-zinc-400 rounded">
                    {task.status}
                  </span>
                </div>
              </div>

              {task.status === "pending" && (
                <button
                  onClick={() => handleCompleteTask(task._id)}
                  className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-lg font-semibold"
                >
                  Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
