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
  const [xp, setXp] = useState(50);
  const [hours, setHours] = useState(24);
  const [requiresProof, setRequiresProof] = useState(true);
  const [loading, setLoading] = useState(false);

  const sendChallenge = async () => {
    if (!title.trim() || !challengerId) return;

    setLoading(true);

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
    } catch (err) {
      console.error("Challenge failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6 space-y-5 border border-zinc-800">

        <h2 className="text-xl font-bold text-red-500 text-center">
          Challenge Your Friend
        </h2>

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
          <label className="text-sm text-zinc-400">XP Reward</label>
          <input
            type="number"
            min={10}
            className="w-full bg-black border border-zinc-700 p-3 rounded-lg"
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
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
