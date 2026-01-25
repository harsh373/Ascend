import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  searchUsers,
  sendRequest,
  getFriends,
  acceptRequest,
} from "../api/friendApi";
import { getFriendsLeaderboard } from "../api/leaderboardApi";
import api from "../api/axios";
import ChallengeModal from "../components/ChallengeModel";

const DEFAULT_AVATAR = "/assets/user.png";

export default function Friends() {
  const { user } = useUser();
  const navigate = useNavigate();
  const userId = user?.id;

  
  const [activeTab, setActiveTab] = useState<'friends' | 'leaderboard'>('friends');

  // Friends tab state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [requested, setRequested] = useState<string[]>([]);

  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  const [openChallenge, setOpenChallenge] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadFriends();
    loadRequests();
    loadLeaderboard();
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

  const loadLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      if (!userId) return;
      const res = await getFriendsLeaderboard(userId);
      setLeaderboard(res.data);
      setLoadingLeaderboard(false);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setLoadingLeaderboard(false);
    }
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
      await loadLeaderboard();
    } catch (err) {
      console.error("Accept failed", err);
    } finally {
      setAccepting(null);
    }
  };

  const isFriend = (id: string) =>
    friends.some((f) => f.clerkUserId === id);

  const getAvatar = (u: any) =>
    u.profileImage || u.clerkImageUrl || DEFAULT_AVATAR;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10 pb-24">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <section className="mb-8">
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            Your Network
          </span>

          <h1 className="text-5xl sm:text-6xl font-black text-red-500 mt-2 mb-4">
            FRIENDS
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl mb-8">
            Build your circle. Social pressure creates progress.
          </p>

      
          <div className="max-w-2xl">
            <div className="relative">
              <img
                src="/assets/search.svg"
                alt="Search"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40"
              />
              <input
                className="w-full pl-12 pr-5 py-3 bg-white text-black border-0 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                placeholder="Search friends..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            
            {query.trim().length >= 2 && (
              <div className="mt-2 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                {searching && (
                  <p className="text-zinc-400 p-4">Searching...</p>
                )}

                {!searching && results.length === 0 && (
                  <p className="text-zinc-500 p-4">No users found.</p>
                )}

                {!searching && results.length > 0 && (
                  <div className="divide-y divide-zinc-800">
                    {results.map((u) => {
                      const alreadyFriend = isFriend(u.clerkUserId);
                      const alreadyRequested = requested.includes(u.clerkUserId);

                      return (
                        <div
                          key={u.clerkUserId}
                          className="p-4 flex justify-between items-center hover:bg-zinc-800 transition group"
                        >
                          <div 
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => {
                              navigate(`/profile/${u.clerkUserId}`);
                              setQuery(""); // Clear search after clicking
                            }}
                          >
                            <img
                              src={getAvatar(u)}
                              alt={u.fullName || u.username}
                              className="w-10 h-10 rounded-full border border-zinc-700 object-cover group-hover:border-red-500 transition"
                            />

                            <div>
                              <p className="font-semibold text-sm group-hover:text-red-400 transition">
                                {u.fullName || u.username}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Level {u.level || 1}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {alreadyFriend ? (
                              <span className="text-emerald-400 font-semibold text-sm">
                                Friends
                              </span>
                            ) : alreadyRequested ? (
                              <span className="text-yellow-400 font-semibold text-sm">
                                Requested
                              </span>
                            ) : (
                              <button
                                disabled={sending === u.clerkUserId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdd(u.clerkUserId);
                                }}
                                className="bg-red-600 hover:bg-red-500 px-4 py-1.5 rounded-md text-sm font-semibold disabled:opacity-50 transition"
                              >
                                {sending === u.clerkUserId ? "..." : "Add"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        
        <section className="mb-8">
          <div className="flex gap-2 border-b border-zinc-800">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'friends'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Friends
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'leaderboard'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </section>

       
        {activeTab === 'friends' ? (
          <>
          
            {requests.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Friend Requests</h2>

                <div className="space-y-3">
                  {requests.map((r) => (
                    <div
                      key={r.clerkUserId}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex justify-between items-center hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 group"
                    >
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => navigate(`/profile/${r.clerkUserId}`)}
                      >
                        <img
                          src={getAvatar(r)}
                          alt={r.fullName || r.username}
                          className="w-12 h-12 rounded-full border border-zinc-700 object-cover group-hover:border-red-500 transition"
                        />

                        <p className="font-semibold group-hover:text-red-400 transition">
                          {r.fullName || r.username}
                        </p>
                      </div>

                      <button
                        disabled={accepting === r.clerkUserId}
                        onClick={() => handleAccept(r.clerkUserId)}
                        className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
                      >
                        {accepting === r.clerkUserId ? "Accepting..." : "Accept"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            
            <section>
              <h2 className="text-2xl font-bold mb-6">Your Squad</h2>

              {friends.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-400">
                  No friends yet. That's a weakness.
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((f) => (
                  <div
                    key={f.clerkUserId}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 group"
                  >
                    <div 
                      className="flex items-center gap-4 mb-4 cursor-pointer"
                      onClick={() => navigate(`/profile/${f.clerkUserId}`)}
                    >
                      <img
                        src={getAvatar(f)}
                        alt={f.fullName || f.username}
                        className="w-14 h-14 rounded-full border border-zinc-700 object-cover group-hover:border-red-500 transition"
                      />

                      <div>
                        <p className="font-bold text-lg group-hover:text-red-400 transition">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenChallenge(f.clerkUserId);
                        }}
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          
          <section>
            <h2 className="text-3xl font-bold mb-6">Leaderboard</h2>
            <p className="text-zinc-400 mb-8">
              Compete with friends you trust. Real progress, real accountability.
            </p>

            {loadingLeaderboard && (
              <p className="text-center text-zinc-400 py-10">Loading...</p>
            )}

            {!loadingLeaderboard && leaderboard.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No rankings yet
                </h3>
                <p className="text-zinc-400">
                  Add friends to compete on the leaderboard
                </p>
              </div>
            )}

            {!loadingLeaderboard && leaderboard.length > 0 && (
              <div className="space-y-3">
                {leaderboard.map((u, i) => {
                  const isYou = u.clerkUserId === userId;

                  return (
                    <div
                      key={u.clerkUserId}
                      onClick={() => navigate(`/profile/${u.clerkUserId}`)}
                      className={`flex items-center justify-between px-5 py-4 rounded-lg border cursor-pointer group hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 ${
                        isYou
                          ? "border-red-500 bg-zinc-900 hover:border-red-400"
                          : "border-zinc-800 bg-zinc-900 hover:border-red-500"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-10 text-zinc-400 font-black text-xl">
                          #{i + 1}
                        </span>

                        <img
                          src={u.profileImage || DEFAULT_AVATAR}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                          }}
                          alt={u.fullName || u.username}
                          className="w-12 h-12 rounded-full object-cover border border-zinc-700 group-hover:border-red-500 transition"
                        />

                        <div>
                          <p className="font-semibold text-lg group-hover:text-red-400 transition">
                            {u.fullName || u.username}
                            {isYou && (
                              <span className="ml-2 text-xs text-red-400 font-bold">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-zinc-400">
                            Level {u.level}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-red-500 text-2xl">
                          {u.xp}
                        </p>
                        <p className="text-xs text-zinc-500 font-semibold">XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

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