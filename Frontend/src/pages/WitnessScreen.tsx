import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { searchUsers } from "../api/friendApi";
import api from "../api/axios";

interface SearchedUser {
  clerkUserId: string;
  username: string;
  fullName: string;
  profileImage?: string;
  clerkImageUrl?: string;
}

export default function WitnessScreen() {
  const { arcId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const res = await searchUsers(value);
      const filtered = (res.data || []).filter(
        (u: SearchedUser) => u.clerkUserId !== user?.id
      );
      setResults(filtered);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (targetUserId: string) => {
    if (!arcId || !user) return;
    try {
      setInvitingId(targetUserId);
      await api.post(`/arcs/${arcId}/invite`, {
        ownerId: user.id,
        invitedUserId: targetUserId
      });
      setInvited((prev) => new Set(prev).add(targetUserId));
    } catch (err) {
      console.error("Invite error:", err);
    } finally {
      setInvitingId(null);
    }
  };

  const getWhatsAppLink = () => {
    const arcLink = `https://3ascend.com/arc/public/${arcId}`;
    const message = `Hey, I just started a journey on 3ascend and I want you to follow along. Check it out here: ${arcLink}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const getAvatar = (u: SearchedUser) =>
    u.profileImage || u.clerkImageUrl || "/assets/user.png";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <p className="text-red-500 uppercase tracking-widest text-xs font-bold mb-3">
            Your arc is live
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Who should witness your journey?
          </h1>
          <p className="text-zinc-400 text-base">
            Add people who will see your progress.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            Search 3ascend users
          </p>

          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition mb-4"
          />

          {searching && (
            <p className="text-zinc-500 text-sm text-center py-2">Searching...</p>
          )}

          {!searching && query.trim().length > 0 && results.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-2">No users found</p>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((u) => (
                <div key={u.clerkUserId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getAvatar(u)}
                      alt={u.username}
                      className="w-9 h-9 rounded-full object-cover bg-zinc-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {u.fullName || u.username}
                      </p>
                      {u.fullName && (
                        <p className="text-zinc-500 text-xs truncate">@{u.username}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleInvite(u.clerkUserId)}
                    disabled={invited.has(u.clerkUserId) || invitingId === u.clerkUserId}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition shrink-0 ${
                      invited.has(u.clerkUserId)
                        ? "bg-zinc-700 text-zinc-400 cursor-default"
                        : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                  >
                    {invited.has(u.clerkUserId)
                      ? "Invited"
                      : invitingId === u.clerkUserId
                      ? "..."
                      : "Invite"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            Send via WhatsApp
          </p>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition text-white"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Send on WhatsApp
          </a>
        </div>

        <button
          onClick={() => navigate(`/arc/${arcId}`)}
          className="w-full py-3 text-zinc-500 hover:text-zinc-400 text-sm font-semibold transition"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}