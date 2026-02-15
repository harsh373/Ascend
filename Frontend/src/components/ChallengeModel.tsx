import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { createChallenge } from "../api/challengeApi";

export default function ChallengeModal({
  opponentId,
  onClose,
}: {
  opponentId: string;
  onClose: () => void;
}) {
  const { user } = useUser();
  const challengerId = user?.id;

  const [title, setTitle] = useState("");
  const [xp, setXp] = useState(10);
  const [hours, setHours] = useState(24);
  const [requiresProof, setRequiresProof] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendChallenge = async () => {
    if (!title.trim() || !challengerId) return;

    // Validate XP range before sending
    if (xp < 1 || xp > 50) {
      setError("XP must be between 1 and 50");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createChallenge({
        challengerId,
        opponentId,
        title,
        xpReward: xp,
        requiresProof,
        hours,
      });

      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Challenge failed", err);
      setError(err.response?.data?.error || "Failed to create challenge");
    } finally {
      setLoading(false);
    }
  };


  const handleXpChange = (value: string) => {
    
    if (value === "") {
      setXp(0);
      return;
    }
    
    const numValue = parseInt(value);
    
    
    if (!isNaN(numValue)) {
      setXp(numValue);
    }
  };

  
  const handleXpBlur = () => {
    if (xp < 1) setXp(1);
    if (xp > 50) setXp(50);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6 space-y-5 border border-zinc-800">

        <h2 className="text-xl font-bold text-red-500 text-center">
          Challenge Your Friend
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Task */}
        <div className="space-y-1">
          <label className="text-sm text-zinc-400">Challenge Task</label>
          <input
            className="w-full bg-black border border-zinc-700 p-3 rounded-lg"
            placeholder="e.g. Study 2 hours"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* XP */}
        <div className="space-y-1">
          <label className="text-sm text-zinc-400">
            XP Reward <span className="text-zinc-600">(1-50)</span>
          </label>
          <input
            type="number"
            min={1}
            max={50}
            className="w-full bg-black border border-zinc-700 p-3 rounded-lg"
            value={xp === 0 ? "" : xp}
            onChange={(e) => handleXpChange(e.target.value)}
            onBlur={handleXpBlur}
          />
        </div>

        {/* Time */}
        <div className="space-y-1">
          <label className="text-sm text-zinc-400">Time Limit (hours)</label>
          <input
            type="number"
            min={1}
            className="w-full bg-black border border-zinc-700 p-3 rounded-lg"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>

        {/* Proof */}
        <label className="flex items-center justify-between bg-black border border-zinc-700 p-3 rounded-lg text-sm">
          <span className="text-zinc-300">Proof Required</span>
          <input
            type="checkbox"
            checked={requiresProof}
            onChange={(e) => setRequiresProof(e.target.checked)}
            className="scale-125"
          />
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-zinc-700 text-zinc-400"
          >
            Cancel
          </button>

          <button
            onClick={sendChallenge}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-red-600 font-semibold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
}