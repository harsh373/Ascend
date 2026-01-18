import { useState } from "react";
import {
  respondChallenge,
  submitChallenge,
  reviewChallenge
} from "../api/challengeApi";
import ProofUpload from "./ProofUpload";

type Challenge = {
  _id: string;
  title: string;
  status: "pending" | "accepted" | "submitted" | "approved" | "failed" | "rejected";
  requiresProof: boolean;
  proof?: string;
};

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { _id, title, status, requiresProof, proof } = challenge;
  const [loading, setLoading] = useState(false);

  const handleAction = async (fn: () => Promise<any>) => {
    setLoading(true);
    await fn();
    window.location.reload(); // MVP shortcut, works
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-400">Status: {status}</p>

      {/* PENDING */}
      {status === "pending" && (
        <div className="flex gap-3 mt-3">
          <button
            disabled={loading}
            onClick={() =>
              handleAction(() =>
                respondChallenge({ challengeId: _id, accept: true })
              )
            }
            className="bg-green-600 px-3 py-1 rounded disabled:opacity-50"
          >
            Accept
          </button>

          <button
            disabled={loading}
            onClick={() =>
              handleAction(() =>
                respondChallenge({ challengeId: _id, accept: false })
              )
            }
            className="bg-red-600 px-3 py-1 rounded disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {/* ACCEPTED */}
      {status === "accepted" && (
        <div className="mt-3">
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
              className="bg-blue-600 px-3 py-1 rounded disabled:opacity-50"
            >
              Mark Complete
            </button>
          )}
        </div>
      )}

      {/* SUBMITTED */}
      {status === "submitted" && (
        <div className="mt-3 flex gap-3">
          <button
            disabled={loading}
            onClick={() =>
              handleAction(() =>
                reviewChallenge({ challengeId: _id, approve: true })
              )
            }
            className="bg-green-600 px-3 py-1 rounded disabled:opacity-50"
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
            className="bg-red-600 px-3 py-1 rounded disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {/* PROOF IMAGE */}
      {proof && (
        <img
          src={proof}
          alt="Proof"
          className="mt-3 rounded max-h-40 object-cover"
        />
      )}
    </div>
  );
}
