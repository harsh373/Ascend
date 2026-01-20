import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getChallenges } from "../api/challengeApi";
import ChallengeCard from "../components/ChallengeCard";

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

export default function Challenges() {
  const { user } = useUser();
  const userId = user?.id;
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    getChallenges(userId)
      .then(res => setChallenges(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Please sign in.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading challenges...
      </div>
    );
  }

  const sent = challenges.filter(
    ch => ch.challengerId === userId && ch.status === "pending"
  );

  const received = challenges.filter(
    ch => ch.opponentId === userId && ch.status === "pending"
  );

  const active = challenges.filter(
    ch => ch.opponentId === userId && ch.status === "accepted"
  );

  const review = challenges.filter(
    ch => ch.challengerId === userId && ch.status === "submitted"
  );

  const completed = challenges
    .filter(ch => ["approved", "failed"].includes(ch.status))
    .slice(0, 1);

  const totalCompleted = challenges.filter(ch => ["approved", "failed"].includes(ch.status)).length;
  const hasMoreCompleted = totalCompleted > 1;

  const isFirstTime = sent.length === 0 && received.length === 0 && active.length === 0 && review.length === 0 && completed.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">

        <section>
          <span className="text-red-500 uppercase tracking-wider text-xs sm:text-sm font-semibold">
            Competitive Mode
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-red-500 mt-2">
            CHALLENGES
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mt-1">
            Prove your discipline. Earn respect.
          </p>
        </section>

        {(sent.length > 0 || isFirstTime) && (
          <ChallengeSection
            title="Sent by You"
            description="Challenges you created"
            data={sent}
            viewMode="sent"
            emptyMessage="You haven't sent any challenges yet"
          />
        )}

        {(received.length > 0 || isFirstTime) && (
          <ChallengeSection
            title="From Friends"
            description="Challenges waiting for your response"
            data={received}
            viewMode="received"
            emptyMessage="No incoming challenges"
          />
        )}

        {(active.length > 0 || isFirstTime) && (
          <ChallengeSection
            title="Active Challenges"
            description="Challenges you accepted and are working on"
            data={active}
            viewMode="active"
            emptyMessage="No active challenges"
          />
        )}

        {(review.length > 0 || isFirstTime) && (
          <ChallengeSection
            title="Pending Reviews"
            description="Your friends submitted proof, waiting for your approval"
            data={review}
            viewMode="review"
            emptyMessage="Nothing to review"
          />
        )}

        {(completed.length > 0 || isFirstTime) && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl sm:text-2xl font-bold">✅ Completed</h2>
              {hasMoreCompleted && (
                <button
                  onClick={() => navigate("/challenges/history")}
                  className="text-sm sm:text-base text-red-400 hover:text-red-300 font-semibold transition flex items-center gap-1"
                >
                  View All ({totalCompleted})
                  <span>→</span>
                </button>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-500 mb-4">Recent challenge results</p>

            {completed.length ? (
              <div className="space-y-3 sm:space-y-4">
                {completed.map(ch => (
                  <ChallengeCard key={ch._id} challenge={ch} viewMode="completed" />
                ))}
              </div>
            ) : (
              <div className="text-zinc-500 italic text-sm">
                No completed challenges yet
              </div>
            )}

            {hasMoreCompleted && (
              <button
                onClick={() => navigate("/challenges/history")}
                className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-3 sm:py-2 rounded-lg font-semibold transition text-sm sm:text-base"
              >
                View All History ({totalCompleted} total) →
              </button>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

type ChallengeSectionProps = {
  title: string;
  description: string;
  data: Challenge[];
  viewMode: "sent" | "received" | "active" | "review" | "completed";
  emptyMessage: string;
};

function ChallengeSection({ title, description, data, viewMode, emptyMessage }: ChallengeSectionProps) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-1">{title}</h2>
      <p className="text-xs sm:text-sm text-zinc-500 mb-4">{description}</p>

      {data.length ? (
        <div className="space-y-3 sm:space-y-4">
          {data.map(ch => (
            <ChallengeCard key={ch._id} challenge={ch} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="text-zinc-500 italic text-sm">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}