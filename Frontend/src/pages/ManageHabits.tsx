import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getHabits, addHabit, updateHabit, deleteHabit } from "../api/habitApi";

interface Habit {
  _id: string;
  title: string;
  streak: number;
  lastCompleted: Date | null;
}

export default function ManageHabits() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHabits = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await getHabits(user.id);
      setHabits(response.data);
    } catch (err) {
      console.error("Failed to load habits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, [user]);

  const handleEdit = (habit: Habit) => {
    setEditingId(habit._id);
    setEditTitle(habit.title);
    setError("");
  };

  const handleSaveEdit = async () => {
    const cleanTitle = editTitle.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 50) {
      setError("Title must be 3-50 characters");
      return;
    }

    try {
      await updateHabit(editingId!, cleanTitle);
      setEditingId(null);
      setEditTitle("");
      setError("");
      loadHabits();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update habit");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setError("");
  };

  const handleAddNew = async () => {
    if (!user) return;

    const cleanTitle = newHabitTitle.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 50) {
      setError("Title must be 3-50 characters");
      return;
    }

    try {
      await addHabit(user.id, cleanTitle);
      setNewHabitTitle("");
      setAddingNew(false);
      setError("");
      loadHabits();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add habit");
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      setDeletingId(null);
      loadHabits();
    } catch (err) {
      console.error("Failed to delete habit", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-red-500">Manage Habits</h1>
          <button
            onClick={() => navigate("/")}
            className="px-3 py-2 sm:px-4 border border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition text-sm sm:text-base"
          >
            ← Back
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-zinc-400">Loading habits...</div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Habits List */}
        {!loading && (
          <div className="space-y-3 mb-6">
            {habits.map((habit) => (
              <div
                key={habit._id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
              >
                {editingId === habit._id ? (
                  // EDIT MODE
                  <div className="space-y-3">
                    <input
                      className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-3 border border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : deletingId === habit._id ? (
                  // DELETE CONFIRMATION
                  <div className="space-y-3">
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                      <p className="text-white mb-1">
                        Delete "<span className="font-bold text-red-400">{habit.title}</span>"?
                      </p>
                      {habit.streak > 0 && (
                        <p className="text-red-400 text-sm">
                          🔥 Your {habit.streak}-day streak will be lost.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="flex-1 py-3 border border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                      >
                        Delete Forever
                      </button>
                    </div>
                  </div>
                ) : (
                  // NORMAL VIEW
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-base sm:text-lg">{habit.title}</h3>
                      <p className="text-sm text-zinc-400">
                        🔥 {habit.streak} day streak
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(habit._id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Habit Section */}
        {!loading && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            {addingNew ? (
              <div className="space-y-3">
                <label className="text-sm text-zinc-400">New Habit Name</label>
                <input
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500"
                  placeholder="e.g. Read 30 mins, Cold shower, Journal"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  autoFocus
                  onKeyPress={(e) => e.key === "Enter" && handleAddNew()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNew}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition"
                  >
                    Add Habit
                  </button>
                  <button
                    onClick={() => {
                      setAddingNew(false);
                      setNewHabitTitle("");
                      setError("");
                    }}
                    className="flex-1 py-3 border border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingNew(true)}
                className="w-full py-3 text-red-500 font-semibold hover:bg-red-500/10 rounded-lg transition"
              >
                + Add New Habit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}