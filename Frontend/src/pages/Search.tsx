import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsers } from "../api/friendApi";

const DEFAULT_AVATAR = "/assets/user.png";

interface User {
  clerkUserId: string;
  username: string;
  fullName: string;
  profileImage?: string;
  clerkImageUrl?: string;
}

export default function Search() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchUsers(query);
        setResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const getAvatar = (u: User) =>
    u.profileImage || u.clerkImageUrl || DEFAULT_AVATAR;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10 pb-24">
      <div className="max-w-4xl mx-auto">
        <section className="mb-8">
          <span className="text-red-500 uppercase tracking-wider text-sm font-semibold">
            Discovery
          </span>

          <h1 className="text-5xl sm:text-6xl font-black text-red-500 mt-2 mb-4">
            SEARCH
          </h1>

          <p className="text-zinc-400 text-lg max-w-2xl mb-8">
            Find people and view their arcs
          </p>

          <div className="relative">
            <img
              src="/assets/search.svg"
              alt="Search"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40"
            />
            <input
              className="w-full pl-12 pr-5 py-3 bg-white text-black border-0 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {query.trim().length === 0 && (
            <div className="mt-8 text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-zinc-500 text-lg">
                Search by name to view profiles.
              </p>
            </div>
          )}

          {query.trim().length >= 1 && (
            <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              {searching && (
                <p className="text-zinc-400 p-4">Searching...</p>
              )}

              {!searching && results.length === 0 && (
                <p className="text-zinc-500 p-4">No users found.</p>
              )}

              {!searching && results.length > 0 && (
                <div className="divide-y divide-zinc-800">
                  {results.map((u) => (
                    <div
                      key={u.clerkUserId}
                      onClick={() => navigate(`/profile/${u.clerkUserId}`)}
                      className="p-4 flex items-center gap-4 hover:bg-zinc-800 cursor-pointer transition group"
                    >
                      <img
                        src={getAvatar(u)}
                        alt={u.fullName || u.username}
                        className="w-12 h-12 rounded-full border border-zinc-700 object-cover group-hover:border-red-500 transition"
                      />

                      <div className="flex-1">
                        <p className="font-semibold text-lg group-hover:text-red-400 transition">
                          {u.fullName || u.username}
                        </p>
                        <p className="text-sm text-zinc-500">
                          View profile
                        </p>
                      </div>

                      <svg
                        className="w-5 h-5 text-zinc-600 group-hover:text-red-500 transition"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}