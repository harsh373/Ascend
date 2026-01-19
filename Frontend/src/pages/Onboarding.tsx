import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { createHabits } from "../api/habitApi";
import { markUserOnboarded } from "../api/userApi";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [habits, setHabits] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (index: number, value: string) => {
    const updated = [...habits];
    updated[index] = value;
    setHabits(updated);
  };

  const addHabit = () => {
    if (habits.length < 5) {
      setHabits([...habits, ""]);
    }
  };

  const removeHabit = (index: number) => {
    if (habits.length <= 3) return;
    setHabits(habits.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const cleanHabits = habits.map(h => h.trim()).filter(Boolean);

    if (cleanHabits.length < 3) {
      setError("Minimum 3 habits required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createHabits(user!.id, cleanHabits);
      await markUserOnboarded(user!.id);   // 🔥 IMPORTANT FIX

      navigate("/"); // go to Home
    } catch (err) {
      console.error(err);
      setError("Failed to save habits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h1 className="text-4xl font-black text-red-500 mb-2">
          Build Your Discipline
        </h1>

        <p className="text-zinc-400 mb-8">
          Choose at least 3 daily habits.  
          These define your progress.
        </p>

        <div className="space-y-4">
          {habits.map((habit, i) => (
            <div key={i} className="flex gap-3">
              <input
                className="flex-1 px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
                placeholder={`Habit ${i + 1}`}
                value={habit}
                onChange={(e) => handleChange(i, e.target.value)}
              />

              {habits.length > 3 && (
                <button
                  onClick={() => removeHabit(i)}
                  className="px-3 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {habits.length < 5 && (
          <button
            onClick={addHabit}
            className="mt-4 text-sm text-zinc-400 hover:text-white"
          >
            + Add another habit
          </button>
        )}

        {error && (
          <p className="text-red-400 text-sm mt-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Start My Journey"}
        </button>
      </div>
    </div>
  );
}
