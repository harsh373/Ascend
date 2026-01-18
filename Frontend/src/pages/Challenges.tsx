import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getChallenges } from "../api/challengeApi";
import ChallengeCard from "../components/ChallengeCard";

type Challenge = {
  _id: string;
  challengerId: string;
  opponentId: string;
  title: string;
  status: "pending" | "accepted" | "submitted" | "approved" | "failed" | "rejected";
  requiresProof: boolean;
  proof?: string;
};

export default function Challenges() {
  const { user } = useUser();
  const userId = user?.id;

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

  const incoming = challenges.filter(
    ch => ch.opponentId === userId && ch.status === "pending"
  );

  const active = challenges.filter(ch => ch.status === "accepted");

  const review = challenges.filter(
    ch => ch.challengerId === userId && ch.status === "submitted"
  );

  const completed = challenges.filter(
    ch => ["approved", "failed"].includes(ch.status)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HEADER */}
        <section>
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            Competitive Mode
          </span>

          <h1 className="text-5xl sm:text-6xl font-black text-red-500 mt-2">
            CHALLENGES
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl">
            Prove your discipline. Earn respect.
          </p>
        </section>

        <ChallengeSection title="Incoming Challenges" data={incoming} />
        <ChallengeSection title="Active Challenges" data={active} />
        <ChallengeSection title="Pending Reviews" data={review} />
        <ChallengeSection title="Completed" data={completed} />

      </div>
    </div>
  );
}

function ChallengeSection({ title, data }: { title: string; data: Challenge[] }) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {data.length ? (
        <div className="space-y-4">
          {data.map(ch => (
            <ChallengeCard key={ch._id} challenge={ch} />
          ))}
        </div>
      ) : (
        <div className="text-zinc-500 italic text-sm">
          Nothing here yet.
        </div>
      )}
    </section>
  );
}
