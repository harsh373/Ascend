import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { createUser, getUserProfile } from "../api/userApi";
import { createTask, getUserTasks, completeTask } from "../api/taskApi";
import { getHabits, completeHabit } from "../api/habitApi";
import { useNavigate } from "react-router-dom";

export default function Habits() {
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

    const init = async () => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

      try {
       
        const profile = await getUserProfile(user.id);
        
       
        if (!profile.data.onboarded) {
          navigate("/onboarding");
          return;
        }
        
      } catch {
        
        console.log("Creating new user...");
        await createUser(
          user.id,
          user.username || user.firstName || "User",
          fullName || "Anonymous User",
          user.imageUrl || ""
        );
        console.log("User created, redirecting to onboarding");
        
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
       
        navigate("/onboarding");
        return;
      }

    
      loadTasks();
      loadHabits();
      loadUserXP();
    };

    init();
  }, [isLoaded, user, navigate]);

  const loadUserXP = async () => {
    if (!userId) return;
    const res = await getUserProfile(userId);
    setXpData({
      xp: res.data.xp,
      level: res.data.level,
    });
  };

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
    await createTask({ userId, title });
    setTitle("");
    loadTasks();
    loadUserXP();
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
    loadTasks();
    loadUserXP();
  };

  const handleCompleteHabit = async (habitId: string) => {
    await completeHabit(habitId);
    loadHabits();
    loadUserXP();
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
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10 pb-24">
      <div className="max-w-7xl mx-auto">

       
        <section className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
                Daily Discipline
              </span>
              <h1 className="text-6xl sm:text-7xl font-black text-red-500 mt-2 mb-4">
                HABITS
              </h1>
              <p className="text-zinc-400 text-lg max-w-2xl">
                Execute your habits. Complete your missions.
              </p>
            </div>

            
            <div className="hidden sm:flex flex-col items-center bg-zinc-900 border-2 border-red-500 rounded-xl px-8 py-6">
              <p className="text-zinc-400 text-xs uppercase tracking-wider">Level</p>
              <p className="text-5xl font-black text-red-500 my-1">{xpData.level}</p>
              <p className="text-zinc-500 text-sm font-semibold">{xpData.xp} XP</p>
            </div>
          </div>
        </section>

       
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Today's Habits</h2>
            
           
            <button
              onClick={() => navigate("/manage-habits")}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition"
            >
              <span className="text-lg">⚙️</span>
              <span className="hidden sm:inline">Manage</span>
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">No habits yet</h3>
              <p className="text-zinc-400 mb-6">Create your first habit to start building discipline.</p>
              <button
                onClick={() => navigate("/manage-habits")}
                className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition"
              >
                Add Your First Habit
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((h) => {
                const done = isCompletedToday(h.lastCompleted);

                return (
                  <div
                    key={h._id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-between items-center hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200"
                  >
                    <div>
                      <p className="font-semibold text-lg mb-1">{h.title}</p>
                      <p className={`text-sm font-semibold ${streakColor(h.streak)}`}>
                        🔥 {h.streak} day streak
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
                      {done ? "✔" : "DONE"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

       
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-12 hover:border-zinc-700 transition">
          <h2 className="text-3xl font-bold mb-2">New Mission</h2>
          <p className="text-zinc-400 mb-6">Create extra objectives for bonus XP.</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              placeholder="Enter your mission..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCreateTask();
              }}
            />

            <button
              onClick={handleCreateTask}
              className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition"
            >
              Add Mission
            </button>
          </div>
        </section>

   
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Your Missions</h2>

            <button
              onClick={() => navigate("/tasks")}
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              View All →
            </button>
          </div>

          {tasks.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">No missions yet</h3>
              <p className="text-zinc-400">Create your first mission above to earn XP.</p>
            </div>
          )}

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-between items-center hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200"
              >
                <div>
                  <p className="font-semibold text-lg mb-2">{task.title}</p>

                  <div className="flex gap-3 text-sm">
                    <span className="px-2.5 py-1 bg-red-500/10 text-red-400 rounded-md font-semibold">
                      +10 XP
                    </span>

                    <span className="px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-md font-semibold capitalize">
                      {task.status}
                    </span>
                  </div>
                </div>

                {task.status === "pending" && (
                  <button
                    onClick={() => handleCompleteTask(task._id)}
                    className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-lg font-semibold transition"
                  >
                    Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}