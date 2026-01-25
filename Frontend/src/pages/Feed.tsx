import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getFeed } from "../api/feedApi";
import ActivityCard from "../components/ActivityCard";

interface Activity {
  friendId: string;
  friendName: string;
  friendPhoto: string;
  activityType: 'habit' | 'streak_milestone' | 'challenge' | 'task' | 'level_up';
  activityText: string;
  metadata: {
    habitName?: string;
    streakCount?: number;
    xpGained?: number;
    challengeTitle?: string;
    level?: number;
    taskTitle?: string;
  };
  timestamp: string;
  timeAgo: string;
}

export default function Feed() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const userId = user?.id;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    loadFeed();
  }, [isLoaded, userId]);

  const loadFeed = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await getFeed(userId);
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error("Error loading feed:", err);
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading...
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadFeed}
            className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg font-semibold transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  
  if (activities.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          
          <section className="mb-12">
            <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
              Daily Discipline
            </span>

            <h1 className="text-6xl sm:text-7xl font-black text-red-500 mt-2 mb-4">
              FEED
            </h1>

            <p className="text-zinc-400 text-lg max-w-2xl">
              See what your circle is doing
            </p>
          </section>

          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No activity yet
            </h2>
            <p className="text-zinc-400 mb-6">
              Add friends to see their activity in your feed.
            </p>
            <button
              onClick={() => navigate("/friends")}
              className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition"
            >
              Add Friends
            </button>
          </div>
        </div>
      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <section className="mb-12">
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            Daily Discipline
          </span>

          <h1 className="text-6xl sm:text-7xl font-black text-red-500 mt-2 mb-4">
            FEED
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl mb-2">
            See what your circle is doing
          </p>
          
          
          <p className="text-zinc-500 text-sm">
            {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </section>

        
        <section>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <ActivityCard
                key={`${activity.friendId}-${activity.timestamp}-${index}`}
                {...activity}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}