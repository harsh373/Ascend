import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  respondChallenge,
  submitChallenge,
  reviewChallenge
} from "../api/challengeApi";
import ProofUpload from "./ProofUpload";
import { timeAgo } from "../utils/timeFormatters";

type Challenge = {
  _id: string;
  challengerId: string;
  opponentId: string;
  challengerName: string;
  challengerPhoto: string;
  opponentName: string;
  opponentPhoto: string;
  title: string;
  xpReward: number;
  status: "pending" | "accepted" | "submitted" | "approved" | "failed" | "rejected";
  requiresProof: boolean;
  proof?: string;
  createdAt: string;
  expiresAt: string;
};

type ChallengeCardProps = {
  challenge: Challenge;
  viewMode: "sent" | "received" | "active" | "review" | "completed";
};

export default function ChallengeCard({ challenge, viewMode }: ChallengeCardProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const userId = user?.id;

  const {
    _id,
    challengerId,
    opponentId,
    challengerName,
    challengerPhoto,
    opponentName,
    opponentPhoto,
    title,
    xpReward,
    status,
    requiresProof,
    proof,
    createdAt
  } = challenge;

  const [loading, setLoading] = useState(false);

  const handleAction = async (fn: () => Promise<any>) => {
    setLoading(true);
    await fn();
    window.location.reload();
  };

  // Determine which user to show based on view mode
  const isChallenger = challengerId === userId;
  const displayName = isChallenger ? opponentName : challengerName;
  const displayPhoto = isChallenger ? opponentPhoto : challengerPhoto;
  const displayUserId = isChallenger ? opponentId : challengerId;

  // Navigate to user profile
  const handleProfileClick = () => {
    navigate(`/profile/${displayUserId}`);
  };

  // Status badge styling
  const statusConfig = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    submitted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    rejected: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 hover:border-zinc-700 transition">
      {/* HEADER: Profile Photo + Name - NOW CLICKABLE */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={displayPhoto || "/assets/user.png"}
          alt={displayName}
          onClick={handleProfileClick}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-zinc-700 object-cover cursor-pointer hover:border-red-500 transition"
        />
        <div className="flex-1 min-w-0">
          <h3 
            onClick={handleProfileClick}
            className="font-bold text-base sm:text-lg truncate cursor-pointer hover:text-red-400 transition"
          >
            {displayName}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500">{timeAgo(createdAt)}</p>
        </div>
        
        {/* Status Badge */}
        <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full border text-xs font-semibold uppercase ${statusConfig[status]}`}>
          {status}
        </div>
      </div>

      {/* CHALLENGE TITLE */}
      <div className="mb-3">
        <p className="text-sm sm:text-base text-zinc-400 mb-1">
          {viewMode === "sent" && `Challenge to ${displayName}`}
          {viewMode === "received" && `Challenge from ${displayName}`}
          {viewMode === "active" && `Challenge from ${displayName}`}
          {viewMode === "review" && `${displayName}'s challenge`}
          {viewMode === "completed" && `Challenge with ${displayName}`}
        </p>
        <p className="text-lg sm:text-xl font-semibold text-white">{title}</p>
      </div>

      {/* XP REWARD */}
      <div className="flex items-center gap-4 mb-4 text-sm sm:text-base text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="text-base sm:text-lg">💰</span>
          <span className="font-semibold text-emerald-400">{xpReward} XP</span>
        </span>
      </div>

      {/* ACTIONS BASED ON VIEW MODE */}

      {/* SENT BY YOU - Show status message */}
      {viewMode === "sent" && status === "pending" && (
        <div className="text-sm text-zinc-500 italic">
          Waiting for {displayName} to respond...
        </div>
      )}

      {viewMode === "sent" && status === "accepted" && (
        <div className="text-sm text-blue-400 italic">
          ✓ {displayName} accepted the challenge!
        </div>
      )}

      {viewMode === "sent" && status === "rejected" && (
        <div className="text-sm text-red-400 italic">
          ✗ {displayName} declined the challenge
        </div>
      )}

      {/* RECEIVED - Accept/Reject buttons */}
      {viewMode === "received" && status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            disabled={loading}
            onClick={() =>
              handleAction(() =>
                respondChallenge({ challengeId: _id, accept: true })
              )
            }
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-4 py-3 sm:py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            Accept Challenge
          </button>

          <button
            disabled={loading}
            onClick={() =>
              handleAction(() =>
                respondChallenge({ challengeId: _id, accept: false })
              )
            }
            className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-3 sm:py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            Decline
          </button>
        </div>
      )}

      
      {viewMode === "active" && status === "accepted" && (
        <div>
          {requiresProof ? (
            <ProofUpload challengeId={_id} />
          ) : (
            <button
              disabled={loading}
              onClick={() =>
                handleAction(() =>
                  submitChallenge({ challengeId: _id, proof: "" })
                )
              }
              className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-3 sm:py-2 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              Mark as Complete
            </button>
          )}
        </div>
      )}

      {/* REVIEW - Approve/Reject with proof */}
      {viewMode === "review" && status === "submitted" && (
        <div className="space-y-3">
          {proof && (
            <div className="w-full rounded-lg border border-zinc-700 overflow-hidden bg-zinc-800">
              <img
                src={proof}
                alt="Challenge Proof"
                className="w-full h-auto object-contain max-h-56"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              disabled={loading}
              onClick={() =>
                handleAction(() =>
                  reviewChallenge({ challengeId: _id, approve: true })
                )
              }
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-4 py-3 sm:py-2 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              Approve
            </button>

            <button
              disabled={loading}
              onClick={() =>
                handleAction(() =>
                  reviewChallenge({ challengeId: _id, approve: false })
                )
              }
              className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-3 sm:py-2 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED - Show result */}
      {viewMode === "completed" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {status === "approved" ? (
              <span className="text-emerald-400 font-semibold">✓ Won {xpReward} XP</span>
            ) : (
              <span className="text-red-400 font-semibold">✗ Challenge Failed</span>
            )}
          </div>

          {/* Show proof for completed challenges if exists - SMALLER SIZE */}
          {proof && (
            <div className="w-full rounded-lg border border-zinc-700 overflow-hidden bg-zinc-800">
              <img
                src={proof}
                alt="Challenge Proof"
                className="w-full h-auto object-contain max-h-56"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}