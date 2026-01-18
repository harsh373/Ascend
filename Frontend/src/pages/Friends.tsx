import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  searchUsers,
  sendRequest,
  getFriends,
  acceptRequest,
} from "../api/friendApi";
import api from "../api/axios";
import ChallengeModal from "../components/ChallengeModel";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=111827&color=fff";

export default function Friends() {
  const { user } = useUser();
  const userId = user?.id;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [requested, setRequested] = useState<string[]>([]);

  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  const [openChallenge, setOpenChallenge] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    loadFriends();
    loadRequests();
  }, [userId]);

  useEffect(() => {
    const ids = requests.map(r => r.clerkUserId);
    setRequested(ids);
  }, [requests]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await searchUsers(query);
      setResults(res.data);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const loadFriends = async () => {
    const res = await getFriends(userId!);
    setFriends(res.data);
  };

  const loadRequests = async () => {
    const res = await api.get(`/users/requests/${userId}`);
    setRequests(res.data);
  };

  const handleAdd = async (toId: string) => {
    if (!userId) return;

    setSending(toId);

    try {
      await sendRequest(userId, toId);
      setRequested(prev => [...prev, toId]);
    } catch (err) {
      console.error("Send request failed", err);
    } finally {
      setSending(null);
    }
  };

  const handleAccept = async (fromId: string) => {
    if (!userId) return;

    setAccepting(fromId);

    try {
      await acceptRequest(userId, fromId);
      await loadFriends();
      await loadRequests();
    } catch (err) {
      console.error("Accept failed", err);
    } finally {
      setAccepting(null);
    }
  };

  const isFriend = (id: string) =>
    friends.some((f) => f.clerkUserId === id);

  // 🔥 Smart avatar resolver
  const getAvatar = (u: any) =>
    u.profileImage || u.clerkImageUrl || DEFAULT_AVATAR;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <section className="mb-12">
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            Your Network
          </span>

          <h1 className="text-5xl sm:text-6xl font-black text-red-500 mt-2 mb-4">
            FRIENDS
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl">
            Build your circle. Social pressure creates progress.
          </p>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <Stat label="Friends" value={friends.length} />
          <Stat label="Requests" value={requests.length} />
          <Stat label="Status" value="Active" />
        </section>

        {/* SEARCH */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold mb-2">Find Players</h2>
          <p className="text-zinc-400 mb-6">Search and add competitors</p>

          <input
            className="w-full px-5 py-4 bg-black border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="mt-6 space-y-3">
            {searching && <p className="text-zinc-400">Searching...</p>}

            {!searching && results.length === 0 && query && (
              <p className="text-zinc-500">No users found.</p>
            )}

            {!searching &&
              results.map((u) => {
                const alreadyFriend = isFriend(u.clerkUserId);
                const alreadyRequested = requested.includes(u.clerkUserId);

                return (
                  <div
                    key={u.clerkUserId}
                    className="bg-black border border-zinc-800 rounded-lg p-4 flex justify-between items-center hover:border-red-500 transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={getAvatar(u)}
                        className="w-12 h-12 rounded-full border border-zinc-700 object-cover"
                      />

                      <div>
                        <p className="font-semibold">
                          {u.fullName || u.username}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Level {u.level || 1}
                        </p>
                      </div>
                    </div>

                    {alreadyFriend ? (
                      <span className="text-emerald-400 font-semibold">
                        Friends
                      </span>
                    ) : alreadyRequested ? (
                      <span className="text-yellow-400 font-semibold">
                        Requested
                      </span>
                    ) : (
                      <button
                        disabled={sending === u.clerkUserId}
                        onClick={() => handleAdd(u.clerkUserId)}
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                      >
                        {sending === u.clerkUserId ? "Sending..." : "Add"}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </section>

        {/* REQUESTS */}
        {requests.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Friend Requests</h2>

            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.clerkUserId}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex justify-between items-center hover:border-red-500 transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getAvatar(r)}
                      className="w-12 h-12 rounded-full border border-zinc-700 object-cover"
                    />

                    <p className="font-semibold">
                      {r.fullName || r.username}
                    </p>
                  </div>

                  <button
                    disabled={accepting === r.clerkUserId}
                    onClick={() => handleAccept(r.clerkUserId)}
                    className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {accepting === r.clerkUserId ? "Accepting..." : "Accept"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FRIEND LIST */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Your Squad</h2>

          {friends.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-400">
              No friends yet. That’s a weakness.
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((f) => (
              <div
                key={f.clerkUserId}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-red-500 transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={getAvatar(f)}
                    className="w-14 h-14 rounded-full border border-zinc-700 object-cover"
                  />

                  <div>
                    <p className="font-bold text-lg">
                      {f.fullName || f.username}
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Level {f.level}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-black rounded-lg p-3 gap-2">
                  <div>
                    <span className="text-zinc-400 text-sm">XP</span>
                    <p className="font-black text-red-500">{f.xp}</p>
                  </div>

                  <button
                    onClick={() => setOpenChallenge(f.clerkUserId)}
                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CHALLENGE MODAL */}
        {openChallenge && (
          <ChallengeModal
            opponentId={openChallenge}
            onClose={() => setOpenChallenge(null)}
          />
        )}

      </div>
    </div>
  );
}

const Stat = ({ label, value }: any) => (
  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-red-500 transition">
    <p className="text-zinc-400 text-xs uppercase">{label}</p>
    <p className="text-4xl font-black text-red-500">{value}</p>
  </div>
);
